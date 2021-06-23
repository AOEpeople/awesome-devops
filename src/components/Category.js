import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ItemForTile from './ItemForTile'
import ItemForList from './ItemForList'

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(4),
  },
  icon: {
    marginRight: theme.spacing(2),
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
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
}));

export default function Category({category, variant}) {

  const classes = useStyles()

  return (<div className={classes.root}>
    <Typography variant="h2" paragraph id={category.slug} name={category.slug}>{category.name}</Typography>
    { category.description && <Typography variant="subtitle1" paragraph>{category.description}</Typography>}
    { !category.items || category.items.length === 0 ? (
      "No items in this category"
    ) : variant === "tile" ? (
      <Grid container spacing={2}>
        { category.items.map((item, id) => <ItemForTile key={id} item={item} />) }
      </Grid>
    ) : (
      category.items.map((item, id) => <ItemForList item={item} key={id} />)
    )}

  </div>)
}