import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Chip } from '@material-ui/core';
import ExternalLink from './ExternalLink'
import WarningIcon from '@material-ui/icons/Warning';

const useStyles = makeStyles((theme) => ({
  link: {
    fontWeight: "bold",
  }
}));

export default function ItemForList({ item }) {
  const classes = useStyles()
  let name = item.name
  if (item.warnings && item.warnings.length > 0) {
    name = <strike>{name}</strike>
  }

  return (
    <Typography>
      <ExternalLink href={item.uri} className={classes.link}>{name}</ExternalLink>{" "}
      { item.warnings && item.warnings.length > 0 && <><Chip color="default" className={classes.chip} size="small" icon={<WarningIcon />} label={item.warnings.length} title={item.warnings.join(" ")} />{" "}</>}
      {"– "}
      {item.description || ""}
    </Typography>
  )
}