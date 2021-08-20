#!/usr/bin/env node

const yaml = require('js-yaml')
const fs = require('fs')
const axios = require('axios')
const { ConcurrencyManager } = require("axios-concurrency");
const ogs = require('open-graph-scraper')

const config = yaml.load(fs.readFileSync(__dirname + '/../awesome-list.yml', 'utf8'))

const walkCategory = async (category) => {
    if(category.categories) {
        category.categories = await Promise.all(category.categories.map(walkCategory))
    }
    category.slug = category.name.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'')
    if(category.items) {
        category.items = await Promise.all(category.items.map(enrichItem)).then(allItems => allItems.sort((one, two) => {
            if (one.name.toUpperCase() < two.name.toUpperCase()) { return -1 }
            if (one.name.toUpperCase() > two.name.toUpperCase()) { return 1 }
            return 0
        }))
    }
    return category
}

const merge = (one, two) => {
    const result = {}
    for (let prop in one) {
        if (one.hasOwnProperty(prop)) {
            result[prop] = one[prop];
        }
    }
    for (let prop in two) {
        if (two.hasOwnProperty(prop)) {
            if (Array.isArray(two[prop]) && Array.isArray(result[prop])) {
                // merge two array
                result[prop] = [...result[prop], ...two[prop]]
            } else {
                // everything else: override
                result[prop] = two[prop];
            }
        }
    }
    return result
}

const githubOptions = {
    baseURL: "https://api.github.com/",
    headers: {
        'Accept': "application/vnd.github.v3+json",
        "User-Agent": "github.com/czenker"
    },
    timeout: 30000
}

const githubToken = process.env?.GITHUB_TOKEN
const githubUsername = process.env?.GITHUB_USERNAME
if (githubToken) {
    if (githubUsername) {
        // if: personal github token
        githubOptions.auth = {
            username: githubUsername,
            password: githubToken,
        }
    } else {
        // if: bearer token from github actions
        githubOptions.headers["Authorization"] = `Bearer ${githubToken}`
    }
}

let githubClient = axios.create(githubOptions);
const manager = ConcurrencyManager(githubClient, 4);


const requestGithub = (path, canFail) => {
    canFail = canFail === undefined ? false : canFail
    // @TODO: Github could respond with a 202 on stats -> this means we should try to request the resource again in a few seconds
    const uri = `/${path}`

    return githubClient.get(uri)
    .catch(function (error) {
        if (error.response?.status === 403 && error.response?.headers?.['x-ratelimit-remaining'] === "0") {
            console.error("Rate limit exceeded.")
            console.error(error.response.data.message)
        } else if (canFail && error.response.status === 404) {
            // ignore
            return error.response
        } else {
            // handle error
            console.error(`Error when calling ${uri}: ${error}`)
        }
    })
}

/**
 * @param {string} githubId format "user/repo"
 * @return hash
 */
const enrichGithub = async (githubId) => {
    console.log('request', githubId)
    return Promise.all([
        requestGithub(`repos/${githubId}`).then(response => {
            // @see https://docs.github.com/en/rest/reference/repos#get-a-repository
            const data = response.data
            console.log('response', githubId)

            const warnings = []

            if (data.archived) {
                warnings.push("The repository is archived.")
            }
            if (data.disabled) {
                warnings.push("The repository is disabled.")
            }
            const hasLicense = data.license && data.license.spdx_id !== "NOASSERTION"
            return {
                name: data.name,
                description: data.description,
                uri: data.homepage || data.html_url,
                logo: data.organization?.avatar_url || data.owner?.avatar_url,
                repo_uri: data.html_url,
                git_clone_uri: data.clone_url,
                git_clone_branch: data.default_branch,
                programing_language: data.language,
                github_stars: data.stargazers_count,
                tags: data.topics,
                license_name: hasLicense ? data.license.name : undefined,
                license_spdx: hasLicense ? data.license.spdx_id : undefined,
                warnings: warnings.length > 0 ? warnings : undefined,
            }
        }),
        requestGithub(`repos/${githubId}/stats/participation`).then(response => {
            // @see https://docs.github.com/en/rest/reference/repos#get-the-weekly-commit-count
            const data = response.data
            const totalContributions = response.data.all.reduce((total, cur) => total + cur, 0)
            if(totalContributions === 0) {
                return {
                    warnings: [
                        `This repo has seen no contributions in the last year.`
                    ]
                }
            } else if (totalContributions === 1) {
                return {
                    warnings: [
                        `This repo has seen only one contribution in the last year.`
                    ]
                }
            } else if (totalContributions <= 5) {
                return {
                    warnings: [
                        `This repo has seen only ${totalContributions} contributions in the last year.`
                    ]
                }
            } else {
                return {}
            }
        }),

        requestGithub(`repos/${githubId}/releases/latest`, true).then(response => {
            // @see https://docs.github.com/en/rest/reference/repos#get-the-latest-release
            const data = response.data
            if (data.published_at) {
                const published_at = Date.parse(data.published_at)
                const now = Date.now()
                if (now - published_at > 365 * 24 * 60 * 60 * 1000) {
                    return {
                        warnings: [
                            "The latest release is more than one year old."
                        ],
                    }
                }
            }
            return {}
        })
    ]).then(all => all.reduce((prev, cur) => merge(prev, cur), {}))
}

/**
 * @param {string} uri
 * @return hash
 */
const enrichArticle = async (uri) => {
    console.log('request', uri)
    return ogs({url: uri, timeout: 30000}).then(data => {
        const { error, result, response } = data;
        console.log('response', uri)
        if (error) {
            throw new Error(`Error when getting ${uri}: ${error}`);
        }
        if (!result.success) {
            throw new Error(`Error when getting Open Graph data from ${uri}.`);
        }
        // @see https://github.com/jshemas/openGraphScraper#results-json
        return {
            name: result.ogTitle,
            description: result.ogDescription,
            logo: result.ogImage?.url,
        }
    })
}

const enrichItem = async (item) => {
    if (item.github) {
        const enriched = await enrichGithub(item.github)
        item = merge(enriched, item)
    } else if (item.uri) {
        const enriched = await enrichArticle(item.uri)
        item = merge(enriched, item)
    }

    return item
}

Promise.all(config.categories.map(walkCategory)).then(categories => {
    config.categories = categories
    fs.writeFileSync(__dirname + '/../src/awesome-list-compiled.json', JSON.stringify(config))
}).catch(error => {
    console.error(`Program failure, because of `, error)
    process.exit(1)
})


