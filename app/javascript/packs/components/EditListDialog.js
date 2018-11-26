import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';
import { Query, Mutation } from 'react-apollo';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import { withStyles } from '@material-ui/core/styles';
import ResponsiveDialog from './ResponsiveDialog';
import GlobalProgress from './GlobalProgress';

import { CREATE_LIST, UPDATE_LIST, GET_LISTS_BY_USER, DELETE_LIST } from '../queries';

const styles = theme => ({
  dialogContent: {
  },
});

class EditProfileDialog extends React.Component {
  state = {
    name: '',
    listSuppressionConfirmation: false,
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.setInitialValues(this.props.list);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.list !== nextProps.list) {
      this.setInitialValues(nextProps.list);
    }
  }

  setInitialValues(list) {
    this.setState({
      id: list.id,
      name: list.name || '',
      description: list.description || '',
    });
  }

  render() {
    const { classes, list, onClose } = this.props;

    return (
      <React.Fragment>
        <ResponsiveDialog
          open={this.props.open}
          onClose={this.props.onClose}
        >
          <GlobalProgress absolute />
          <DialogTitle>
            {
              list.id ? `Edit ${list.name}` : "Create a new user list"
            }
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <TextField
              label="Name"
              name="name"
              value={this.state.name}
              onChange={(e) => this.setState({ name: e.target.value })}
              margin="dense"
              fullWidth
              autoFocus
              placeholder="Ex: friends, patrons…"
            />
            <TextField
              label="Description"
              name="description"
              value={this.state.description}
              onChange={(e) => this.setState({ description: e.target.value })}
              margin="dense"
              fullWidth
              multiline
              rows={3}
              rowsMax={12}
            />
          </DialogContent>
          <DialogActions>
            {
              list.id ?
                <Grid container spacing={0} justify="space-between">
                  <Grid item>
                    <Button
                      color={"secondary"}
                      onClick={() => {
                        this.setState({ listSuppressionConfirmation: true });
                      }}
                      >
                        Delete list
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button onClick={this.props.onClose}>
                      Cancel
                    </Button>
                    <Mutation
                      mutation={UPDATE_LIST}
                      update={(cache, { data: { updateList } }) => {
                        const { listsByUser } = cache.readQuery({ query: GET_LISTS_BY_USER, variables: { userId: list.userId } });

                        cache.writeQuery({
                          query: GET_LISTS_BY_USER,
                          variables: { userId: list.userId },
                          data: {
                            listsByUser: listsByUser.reduce((listsByUser, otherList) => {
                              if (otherList.id === list.id) {
                                return ([ ...listsByUser, updateList.list ]);
                              }
                              return ([ ...listsByUser, otherList ]);
                            }, [])
                          }
                        });
                      }}
                    >
                      {
                        (createList, { called }) => {
                          return (
                            <Button
                              disabled={!this.state.name || /^\s*$/.test(this.state.name)}
                              onClick={() => {
                                createList({
                                  variables: {
                                    input: {
                                      id: this.state.id,
                                      name: this.state.name,
                                      description: this.state.description,
                                    }
                                  }
                                }).then(() => {
                                  onClose();
                                });
                              }}
                            >
                              Save
                            </Button>
                          );
                        }
                      }
                    </Mutation>
                  </Grid>
                </Grid> :
                <React.Fragment>
                  <Button onClick={this.props.onClose}>
                    Cancel
                  </Button>
                  <Mutation
                    mutation={CREATE_LIST}
                    update={(cache, { data: { createList } }) => {
                      const { listsByUser } = cache.readQuery({ query: GET_LISTS_BY_USER, variables: { userId: list.userId } });

                      cache.writeQuery({
                        query: GET_LISTS_BY_USER,
                        variables: { userId: list.userId },
                        data: { listsByUser: [ createList.list, ...listsByUser ] }
                      });
                    }}
                  >
                    {
                      (createList, { called }) => {
                        return (
                          <Button
                            disabled={!this.state.name || /^\s*$/.test(this.state.name)}
                            onClick={() => {
                              createList({
                                variables: {
                                  input: {
                                    name: this.state.name,
                                    description: this.state.description,
                                  }
                                }
                              }).then(() => {
                                onClose();
                              });
                            }}
                          >
                            Create
                          </Button>
                        );
                      }
                    }
                  </Mutation>
                </React.Fragment>
            }
          </DialogActions>
        </ResponsiveDialog>
        <Dialog
          open={this.state.listSuppressionConfirmation}
          onClose={() => {
            this.setState({ listSuppressionConfirmation: false })
          }}
        >
          <DialogTitle>{`Are you sure you want to delete ${list.name}?`}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The list will be permanently deleted, this operation cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({ listSuppressionConfirmation: false })
              }}
            >
              Cancel
            </Button>
            <Mutation
              mutation={DELETE_LIST}
              update={(cache, { data: { deleteList } }) => {
                const { listsByUser } = cache.readQuery({ query: GET_LISTS_BY_USER, variables: { userId: list.userId } });

                cache.writeQuery({
                  query: GET_LISTS_BY_USER,
                  variables: { userId: list.userId },
                  data: { listsByUser: listsByUser.filter((otherList) => otherList.id !== list.id) }
                });
              }}
            >
              {
                (deleteList, { called }) => (
                  <Button
                    color="secondary"
                    onClick={() => {
                      deleteList({ variables: { input: { id: list.id }}}).then(() => {
                        onClose();
                      });
                    }}
                  >
                    Confirm
                  </Button>
                )
              }
            </Mutation>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(EditProfileDialog));
