// import React from 'react';
// import { withStyles } from '@material-ui/core/styles';
// import withWidth from '@material-ui/core/withWidth';
// import { Query, Mutation, withApollo } from 'react-apollo';
// import { Link } from 'react-router-dom';
// import Button from '@material-ui/core/Button';
// import DialogActions from '@material-ui/core/DialogActions';
// import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
// import DialogTitle from '@material-ui/core/DialogTitle';
// import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
// import ListSubheader from '@material-ui/core/ListSubheader';
// import ListItemText from '@material-ui/core/ListItemText';
// import Typography from '@material-ui/core/Typography';
// import ListItemIcon from '@material-ui/core/ListItemIcon';
// import Grid from '@material-ui/core/Grid';
// import TextField from '@material-ui/core/TextField';
// import IconButton from '@material-ui/core/IconButton';
// import CloseIcon from '@material-ui/icons/Close';
// import BackIcon from '@material-ui/icons/ArrowBack';
// import SendIcon from '@material-ui/icons/Send';
// import EmptyListIcon  from '@material-ui/icons/GroupOutlined';
// import dayjs from 'dayjs';
//
// import ResponsiveDialog from './ResponsiveDialog';
// import UserAvatar from './UserAvatar';
// import EmptyList from './EmptyList';
// import withCurrentSession from './withCurrentSession';
// import FormattedText from './FormattedText';
// import InteractiveTextInput from './InteractiveTextInput';
// import timeAgo from '../timeAgo';
//
// import { combineUUIDs } from '../utils';
//
// import { GET_LISTS_BY_USER, GET_MESSAGES, CREATE_MESSAGE } from '../queries';
//
// const styles = (theme) => ({
//   title: {
//     padding: theme.spacing.unit * 1,
//   },
//   userLink: {
//     color: theme.palette.text.primary,
//     textDecoration: 'none'
//   },
//   messageGrid: {
//     flexGrow: 1,
//   },
//   listsTitle: {
//     marginLeft: 20,
//   },
//   userTitle: {
//     overflow: 'hidden'
//   },
//   messageInput: {
//     paddingTop: 12
//   },
//   timestamp: {
//     paddingRight: 4,
//     textAlign: 'right',
//   },
//   messages: {
//     paddingBottom: 0,
//     paddingLeft: theme.spacing.unit,
//     paddingRight: theme.spacing.unit,
//     paddingTop: theme.spacing.unit,
//     flex: "1 1 auto",
//     overflowY: 'auto',
//     overflowX: 'hidden',
//     // minHeight: 300,
//   },
//   messageBox: {
//     flexGrow: 1,
//     // padding: theme.spacing.unit * 2,
//     background: theme.palette.type === 'dark' ? "rgba(255, 255, 255, 0.09)" : "rgba(0, 0, 0, 0.09)",
//     borderRadius: 3,
//     alignItems: 'center',
//   },
//   messageText: {
//     padding: theme.spacing.unit,
//   },
//   messageActions: {
//     paddingTop: theme.spacing.unit,
//   },
//   leftIcon: {
//     marginRight: theme.spacing.unit,
//   },
//   inputAvatarContainer: {
//     paddingLeft: 4,
//     paddingRight: 4,
//   },
//   listsContainer: {
//     paddingLeft: 0,
//     paddingRight: 0,
//   },
//   emptyListsContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     paddingTop: theme.spacing.unit * 8,
//     paddingBottom: theme.spacing.unit * 8,
//   },
//   emptyListsIcon: {
//     fontSize: 2,
//     display: 'block',
//     fontSize: '4em',
//     marginLeft: 'auto',
//     marginRight: 'auto',
//     marginBottom: theme.spacing.unit,
//     color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
//   },
//   newListButtonContainer: {
//     width: '100%',
//     textAlign: 'center',
//     marginTop: theme.spacing.unit * 3
//   },
// });
//
// class MessageInput extends React.Component {
//   state = {
//     message: ''
//   }
//
//   handleSend(createMessage) {
//     if (this.state.message.match(/^\s*$/)) {
//       return;
//     }
//     createMessage({
//       variables: {
//         input: {
//           recipientId: this.props.user.id,
//           body: this.state.message,
//         }
//       }
//     }).then(() => {
//       this.setState({ message: '' });
//     });
//   }
//
//   render() {
//     const { classes, currentSession, user } = this.props;
//
//     return (
//       <Mutation
//         mutation={CREATE_MESSAGE}
//         update={(cache, { data: { createMessage } }) => {
//           const listId = combineUUIDs(user.id, currentSession.user.id);
//
//           const { messages } = cache.readQuery({ query: GET_MESSAGES, variables: { listId } });
//           cache.writeQuery({
//             query: GET_MESSAGES,
//             variables: { listId },
//             data: { messages: [...messages, createMessage.message ] }
//           });
//
//           try {
//             const listId = combineUUIDs(user.id, currentSession.user.id);
//             const { lists } = cache.readQuery({ query: GET_LISTS });
//             cache.writeQuery({
//               query: GET_LISTS,
//               data: {
//                 lists: lists.map((list) => {
//                   if (list.id === listId) {
//                     list.lastMessage = createMessage.message;
//                   }
//                   return (list);
//                 })
//               }
//             });
//           } catch (e) {
//             console.log(e);
//           }
//         }}
//       >
//         {( createMessage, { data }) => (
//           <Grid spacing={8} container alignItems="flex-end" wrap="nowrap">
//             <Grid item>
//               <div className={classes.inputAvatarContainer}>
//                 <UserAvatar user={currentSession.user} />
//               </div>
//             </Grid>
//             <Grid item className={classes.messageGrid}>
//               <InteractiveTextInput
//                 InputProps={{
//                   className: classes.messageInput
//                 }}
//                 placeholder="Write your message"
//                 name="message"
//                 value={this.state.message}
//                 onChange={(e) => {
//                   this.setState({ message: e.target.value })
//                 }}
//                 onKeyPress={(e) => {
//                   const keyCode = e.keyCode || e.which;
//                   if (keyCode === 13) {
//                     if (e.ctrlKey) {
//                       this.setState({ message: `${this.state.message}\n` })
//                     } else {
//                       e.preventDefault();
//                       this.handleSend(createMessage);
//                     }
//                   }
//                 }}
//                 variant="filled"
//                 fullWidth
//                 multiline
//                 rows={1}
//                 rowsMax={12}
//                 autoFocus
//                 required
//               />
//             </Grid>
//             <Grid item>
//               <IconButton
//                 variant="outlined"
//                 margin="none"
//                 onClick={() => {
//                   this.handleSend(createMessage);
//                 }}
//               >
//                 <SendIcon />
//               </IconButton>
//             </Grid>
//           </Grid>
//         )}
//       </Mutation>
//     );
//   }
// }
//
// class ListDialog extends React.Component {
//   constructor(props) {
//     super(props);
//   }
//
//   componentDidMount() {
//   }
//
//   componentWillReceiveProps(nextProps) {
//   }
//
//   renderMessage(message, last) {
//     const { classes, user, currentSession, onClose } = this.props;
//
//     const Timestamp = () =>
//       <Typography variant="caption" className={classes.timestamp}>
//         {timeAgo.format(dayjs(message.createdAt).toDate())}
//       </Typography>
//
//     if (message.senderId === currentSession.user.id) {
//       return (
//         <Grid container spacing={8} key={message.id} alignItems="flex-end" wrap="nowrap" style={{ marginBottom: last ? 4 : 16 }}>
//           <Grid item className={classes.messageBox} style={{ marginRight: 8, marginLeft: 56 }}>
//             <FormattedText text={message.body} className={classes.messageText} onChangeLocation={onClose} />
//             <Timestamp />
//           </Grid>
//           <Grid
//             item
//             onClick={() => {
//               onClose();
//             }}
//           >
//             <Link to={`/${currentSession.user.slug}`}>
//               <UserAvatar user={currentSession.user} />
//             </Link>
//           </Grid>
//         </Grid>
//       );
//     } else {
//       return (
//         <Grid container spacing={8} key={message.id} alignItems="flex-end" wrap="nowrap" style={{ marginBottom: last ? 4 : 16 }}>
//           <Grid
//             item
//             onClick={() => {
//               onClose();
//             }}
//           >
//             <Link to={`/${user.slug}`}>
//               <UserAvatar user={user} />
//             </Link>
//           </Grid>
//           <Grid item className={classes.messageBox} style={{ marginLeft: 8, marginRight: 56 }}>
//             <FormattedText text={message.body} className={classes.messageText} onChangeLocation={onClose} />
//             <Timestamp />
//           </Grid>
//         </Grid>
//       );
//     }
//   }
//
//   render() {
//     const { classes, open, onClose, onBack, user, currentSession, messages, width, roster } = this.props;
//
//     return (
//       <React.Fragment>
//         <DialogTitle className={classes.title}>
//           <Grid container spacing={0} alignItems="center" justify="space-between" wrap="nowrap">
//             <Grid item>
//               <Grid container spacing={0} alignItems="center" justify="flex-start" wrap="nowrap">
//                 <Grid item>
//                   {
//                     roster &&
//                       <IconButton color="inherit" onClick={onBack}>
//                         <BackIcon />
//                       </IconButton>
//                   }
//                 </Grid>
//                 <Grid
//                   item
//                   style={{ marginLeft: 8 }}
//                   onClick={() => {
//                     onClose();
//                   }}
//                 >
//                   <Link to={`/${user.slug}`} className={classes.userLink}>
//                     <Grid container spacing={0} alignItems="center" className={classes.userTitle} wrap="nowrap">
//                       <Grid item>
//                         <UserAvatar user={user} className={classes.userAvatar} />
//                       </Grid>
//                       <Grid item style={{ marginLeft: 8 }}>
//                         {user.name}
//                       </Grid>
//                     </Grid>
//                   </Link>
//                 </Grid>
//               </Grid>
//             </Grid>
//             <Grid item>
//               <IconButton color="inherit" onClick={onClose} aria-label="Close">
//                 <CloseIcon />
//               </IconButton>
//             </Grid>
//           </Grid>
//         </DialogTitle>
//           {
//             messages.length === 0 ?
//               <DialogContent className={classes.emptyListsContainer}>
//                 <EmptyListIcon className={classes.emptyListsIcon} />
//                 <EmptyList
//                   label={`No messages`}
//                 />
//               </DialogContent> :
//               <div
//                 className={classes.messages}
//                 ref={this.messagesScroll}
//                 style={{
//                   minHeight: (width === 'lg' || width === 'xl' ? 300 : 0)
//                 }}
//               >
//                 {
//                   messages.map((message, index) => (
//                     this.renderMessage(message, messages.length === (index + 1))
//                   ))
//                 }
//               </div>
//           }
//         <DialogActions className={classes.messageActions}>
//           <MessageInput currentSession={currentSession} user={user} classes={classes} />
//         </DialogActions>
//       </React.Fragment>
//     );
//   }
// }
//
// const ListDialogWithApollo = withApollo(withWidth()(ListDialog));
//
// class ListsDialog extends React.Component {
//   renderLastMessage(list) {
//     const { currentSession } = this.props;
//
//     if (!list.lastMessage) {
//       return ('')
//     }
//     if (list.lastMessage.senderId === currentSession.user.id) {
//       return (`You: ${list.lastMessage.body}`);
//     } else {
//       return (list.lastMessage.body);
//     }
//   }
//
//   renderList(list) {
//     const { currentSession, onUserSelected, classes } = this.props;
//
//     return (
//       <ListItem
//         key={list.id}
//         button
//         onClick={() => onUserSelected(list.contact)}
//       >
//         <UserAvatar user={list.contact} />
//         <ListItemText primary={list.contact.name} secondary={this.renderLastMessage(list)} />
//       </ListItem>
//     );
//   }
//
//   render() {
//     const { lists, classes, onClose, width } = this.props;
//
//     return (
//       <React.Fragment>
//         {
//           lists.length > 0 ?
//             <DialogContent
//               className={classes.listsContainer}
//               style={{
//                 minHeight: (width === 'lg' || width === 'xl' ? 300 : 0),
//                 paddingTop: 0,
//               }}
//             >
//               <List>
//                 {
//                   lists.map((list) => (
//                     this.renderList(list)
//                   ))
//                 }
//               </List>
//             </DialogContent> :
//             <React.Fragment>
//               <DialogTitle><span></span></DialogTitle>
//               <DialogContent className={classes.emptyListsContainer}>
//                 <EmptyListIcon className={classes.emptyListsIcon} />
//                 <EmptyList
//                   label={`No user lists`}
//                 />
//                 <div
//                   className={classes.newListButtonContainer}
//                 >
//                   <Button
//                     variant="outlined"
//                     size="large"
//                   >
//                     Create a new list
//                   </Button>
//                 </div>
//               </DialogContent>
//             </React.Fragment>
//         }
//         <DialogActions>
//           <Button onClick={onClose} aria-label="Close">
//             Close
//           </Button>
//         </DialogActions>
//       </React.Fragment>
//     )
//   }
// }
//
// const ListsDialogWithWidth = withWidth()(ListsDialog);
//
// class ListDialogLoader extends React.Component {
//   state = {
//     user: null
//   }
//
//   componentDidMount() {
//     this.setState({ user: this.props.user })
//   }
//
//   componentWillReceiveProps(nextProps) {
//     this.setState({ user: nextProps.user })
//   }
//
//   render() {
//     const { currentSession, open, onClose, ...props } = this.props;
//
//     let offset = 0;
//     let limit = parseInt(process.env.MESSAGES_PAGE_SIZE);
//
//     if (!currentSession) {
//       return (null);
//     }
//
//     return (
//       <ResponsiveDialog
//         open={open}
//         onClose={onClose}
//       >
//         {
//           open && !this.state.user &&
//             <Query query={GET_LISTS} variables={{ sort: "latest", offset, limit }} fetchPolicy="network-only" pollInterval={parseInt(process.env.MESSAGES_REFRESH_INTERVAL)}>
//               {({ data, loading, error, fetchMore }) => {
//                 if (loading || error) {
//                   return (null);
//                 }
//
//                 return (
//                   <ListsDialogWithWidth
//                     {...props}
//                     currentSession={currentSession}
//                     open={open}
//                     onClose={onClose}
//                     lists={data.lists}
//                     onUserSelected={(user) => {
//                       this.setState({ user })
//                     }}
//                   />
//                 );
//               }}
//             </Query>
//         }
//         {
//           open && this.state.user &&
//             <Query query={GET_MESSAGES} variables={{ sort: "latest", listId: combineUUIDs(this.state.user.id, currentSession.user.id), offset, limit }} fetchPolicy="network-only" pollInterval={parseInt(process.env.MESSAGES_REFRESH_INTERVAL)}>
//               {({ data, loading, error, fetchMore }) => {
//                 if (loading || error) {
//                   return (null);
//                 }
//
//                 return (
//                   <ListDialogWithApollo
//                     {...props}
//                     currentSession={currentSession}
//                     user={this.state.user}
//                     open={open}
//                     onClose={onClose}
//                     messages={data.messages}
//                     onBack={() => {
//                       this.setState({ user: null });
//                     }}
//                   />
//                 );
//               }}
//             </Query>
//         }
//       </ResponsiveDialog>
//     );
//   }
// }
//
// export default withCurrentSession(
//   withStyles(styles)(ListDialogLoader)
// );
