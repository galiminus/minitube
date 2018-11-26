import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';

import VisibilitySensor from 'react-visibility-sensor';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { Link, withRouter } from 'react-router-dom';
import TruncatedText from './TruncatedText';
import EditListDialog from './EditListDialog';
import countFormat from '../countFormat';

const styles = theme => ({
  card: {
    width: '100%',
    borderRadius: 0,
  },
  listLink: {
    color: theme.palette.text.primary,
    textDecoration: 'none'
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  userCount: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingRight: theme.spacing.unit * 3
  }
});

class ListCard extends React.Component {
  state = {
    editDialog: false,
  }

  renderHeader() {
    const { classes, list } = this.props;

    return (
      <CardHeader
        title={list.name}
        subheader={list.description || "No description"}
      />
    );
  }

  render() {
    const { classes, list } = this.props;

    return (
      <React.Fragment>
        <Card className={classes.card} elevation={0}>
          <Grid container spacing={0} justify="space-between" wrap='nowrap'>
            <Grid item>
              {this.renderHeader()}
            </Grid>
            <Grid item className={classes.userCount}>
              <Button
                onClick={() => {
                  this.setState({ editDialog: true });
                }}
              >
                Edit
              </Button>
              <Typography variant="button">

              </Typography>
            </Grid>
          </Grid>
        </Card>
        <EditListDialog
          open={this.state.editDialog}
          list={list}
          onClose={() => {
            this.setState({ editDialog: false });
          }}
        />
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(
  withWidth()(ListCard)
);
