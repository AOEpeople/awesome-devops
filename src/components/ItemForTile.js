import React from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Chip } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';
import GavelIcon from '@material-ui/icons/Gavel';
import WarningIcon from '@material-ui/icons/Warning';
import TranslateIcon from '@material-ui/icons/Translate';

const useStyles = makeStyles((theme) => ({
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
    paddingTop: '75%',
  },
  cardContent: {
    flexGrow: 1,
  },
  cardStats: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  chip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
}));

function shortInt(value) {
  if (value > 1_000_000) {
    return (value / 1_000_000).toFixed(1) + "M"
  } else if (value > 1_000) {
    return (value / 1_000).toFixed(1) + "k"
  } else {
    return `${value}`
  }
}

function Stats({item, classes}) {
  return <>
  { item.github_stars && <Chip className={classes.chip} size="small" icon={<StarIcon />} label={shortInt(item.github_stars)} title="Github Stars" />}
  { item.license_spdx && <Chip className={classes.chip} size="small" icon={<GavelIcon />} label={shortInt(item.license_spdx)} title={item.license_name || "License"} />}
  { item.programing_language && <Chip className={classes.chip} size="small" icon={<TranslateIcon />} label={item.programing_language} title={"Main Programming Language"} />}
  { item.warnings && item.warnings.length > 0 && <Chip color="secondary" className={classes.chip} size="small" icon={<WarningIcon />} label={item.warnings.length} title={item.warnings.join(" ")} />}
  </>
}

export default function ItemForTile({ item }) {
  const classes = useStyles()

  return (
    <Grid item xs={12} sm={6} md={4}>
    <Card className={classes.card}>
      <CardMedia
        className={classes.cardMedia}
        image={item.logo}
      />
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="h5" component="h2">
          {item.name}
        </Typography>
        <Typography>
          {item.description}
        </Typography>
      </CardContent>
      <CardContent className={classes.cardStats}>
        <Stats item={item} classes={classes} />
      </CardContent>
      <CardActions>
        { item.uri && item.uri !== item.repo_uri && <Button size="small" color="primary" href={item.uri} target="_blank" rel="noreferrer noopener">View</Button> }
        { item.repo_uri && <Button size="small" color="primary" href={item.repo_uri} target="_blank" rel="noreferrer noopener">Repo</Button> }
      </CardActions>
    </Card>
    </Grid>)
}