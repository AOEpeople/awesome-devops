import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CameraIcon from '@material-ui/icons/PhotoCamera';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import { Chip } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';
import GavelIcon from '@material-ui/icons/Gavel';
import ExternalLink from './ExternalLink'
import { IconButton } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';

const useStyles = makeStyles((theme) => ({
  link: {
    fontWeight: "bold",
  }
}));

export default function ItemForList({ item }) {
  const classes = useStyles()

  return (
    <Typography>
      <ExternalLink href={item.uri} className={classes.link}>{item.name}</ExternalLink>{" "}
      { item.warnings && item.warnings.length > 0 && <><Chip color="default" className={classes.chip} size="small" icon={<WarningIcon />} label={item.warnings.length} title={item.warnings.join(" ")} />{" "}</>}
      {item.description || ""}
    </Typography>
  )
}