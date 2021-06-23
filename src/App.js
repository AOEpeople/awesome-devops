import React, {useState} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import MenuIcon from '@material-ui/icons/Menu';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Category from './components/Category'
import ListIcon from '@material-ui/icons/List';
import AppsIcon from '@material-ui/icons/Apps';
import ExternalLink from './components/ExternalLink';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import { Drawer, List, ListItem, ListItemText, InputBase } from '@material-ui/core';
import { fade } from '@material-ui/core';

import awesomeJson from './awesome-list-compiled.json'

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  buttonGroup: {
    textAlign: "right",
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },

  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

function valueContains(value, searchTerm) {
  if (Array.isArray(value)) {
    return value.some(val => valueContains(val, searchTerm))
  } else if (value.toLowerCase) {
    return value.toLowerCase().includes(searchTerm)
  } else {
    return Object.values(value).some(val => valueContains(val, searchTerm))
  }
}

function filterAwesome(searchTerm) {
  if (!searchTerm) {
    return awesomeJson
  }

  searchTerm = searchTerm.toLowerCase()

  // poor man's deep copy
  const awesome = JSON.parse(JSON.stringify(awesomeJson))

  awesome.categories = awesome.categories.map(category => {
    category.items = (category.items || []).filter(item => valueContains(item, searchTerm))
    return category
  }).filter(category => category.items && category.items.length > 0)

  return awesome
}

export default function Album() {
  const [variant, setVariant] = useState("tile")
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const classes = useStyles();

  const filteredAwesome = filterAwesome(searchTerm)

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={() => setNavigationOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title} noWrap>{filteredAwesome.meta.name}</Typography>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
              onChange={(el) => setSearchTerm(el.target.value)}
            />
          </div>
          <IconButton
            aria-label="account of current user"
            color="inherit"
            href={filteredAwesome.meta.edit_link} target="_blank" rel="noreferrer noopener"
          >
            <EditIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={navigationOpen} onClose={() => setNavigationOpen(false)}>
        <List>
          {awesomeJson.categories.map((category, index) => (
            <ListItem button key={index} onClick={() => {
              console.log(window.location)
              setNavigationOpen(false)
              setTimeout(() => {

                window.location.hash = `#${category.slug}`
              }, 100)
            }

              }>
              <ListItemText primary={category.name}/>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <main>
        {/* Hero unit */}
        <div className={classes.heroContent}>
          <Container maxWidth="sm">
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>{filteredAwesome.meta.name}</Typography>
            <Typography variant="h5" align="center" color="textSecondary" paragraph>
              An opinionated collection of awesome links on the topic of DevOps and anything related.
              Curated by <ExternalLink href="https://aoe.com">AOE GmbH</ExternalLink>.
            </Typography>
            <div className={classes.heroButtons}>
              <Grid container spacing={2} justify="center">
                <Grid item>
                  <Button variant="outlined" color="primary" href={filteredAwesome.meta.edit_link} target="_blank" rel="noreferrer noopener">
                    You can edit it
                  </Button>
                </Grid>
              </Grid>
            </div>
          </Container>
        </div>

        <Container maxWidth={variant === "item" ? "md" : "xl"}>
          <div className={classes.buttonGroup}>
            <ButtonGroup size="small">
              <IconButton aria-label="tile view" onClick={() => setVariant("tile")} color={variant==="tile" ? "primary" : null}>
                <AppsIcon fontSize="large" />
              </IconButton>
              <IconButton aria-label="item view" onClick={() => setVariant("item")} color={variant==="item" ? "primary" : null}>
                <ListIcon fontSize="large" />
              </IconButton>
            </ButtonGroup>
          </div>
            {filteredAwesome.categories.map(category => <Category category={category} variant={variant} />)}
        </Container>
      </main>
      {/* Footer */}
      <footer className={classes.footer}>
        <Typography variant="h6" align="center" gutterBottom>{filteredAwesome.meta.name}</Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
          <ExternalLink href="https://openmoji.org/library/#search=sunglass&amp;emoji=1F60E">The Logo</ExternalLink> is licensed <ExternalLink href="https://creativecommons.org/licenses/by-sa/4.0/">CC-BY-4.0</ExternalLink>.
        </Typography>
      </footer>
      {/* End footer */}
    </React.Fragment>
  );
}