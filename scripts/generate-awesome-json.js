#!/usr/bin/env node

const yaml = require('js-yaml')
const fs = require('fs')
const axios = require('axios')
const ogs = require('open-graph-scraper')

const config = yaml.load(fs.readFileSync(__dirname + '/../awesome-list.yml', 'utf8'))

const walkCategory = async (category) => {
    if(category.categories) {
        category.categories = await Promise.all(category.categories.map(walkCategory))
    }
    if(category.items) {
        category.items = await Promise.all(category.items.map(enrichItem))
    }
    return category
}

const requestGithub = (path) => {
    // @TODO: inject token to prevent rate limits
    const uri = `https://api.github.com/${path}`
    return axios.get(uri, {
        headers: {
            'Accept': "application/vnd.github.v3+json",
        }
    })
    .catch(function (error) {
        // handle error
        console.error(`Error when calling ${uri}: ${error}`)
    })
}

/**
 * @param {string} githubId format "user/repo"
 * @return hash
 */
const enrichGithub = async (githubId) => {
    console.log('request', githubId)
    return requestGithub(`repos/${githubId}`).then(response => {
        // @see https://docs.github.com/en/rest/reference/repos#get-a-repository
        const data = response.data
        console.log('response', githubId)
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
            deprecated: data.archived || data.disabled,
            license_name: data.license.name,
            license_spdx: data.license.spdx_id,
        }
    })
}

/**
 * @param {string} uri
 * @return hash
 */
const enrichArticle = async (uri) => {
    console.log('request', uri)
    return ogs({url: uri}).then(data => {
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
        item = {...enriched, ...item}
    } else if (item.uri) {
        const enriched = await enrichArticle(item.uri)
        item = {...enriched, ...item}
    }

    return item
}

Promise.all(config.categories.map(walkCategory)).then(categories => {
    config.categories = categories
    fs.writeFileSync(__dirname + '/../src/awesome-list-compiled.json', JSON.stringify(config))
})


