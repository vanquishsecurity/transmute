import React from 'react';
import classNames from 'classnames';

import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';

const openpgp = require('openpgp');

const styles = theme => ({
  formControl: {
    minWidth: '100%'
  }
});

class KeyUploadForm extends React.Component {
  state = {
    error: null,
    primary_key: null,
    primary_key_filename: null,
    recovery_key: null,
    recovery_key_filename: null,
    email: null,
    firstName: null,
    lastName: null
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.onSubmit({
      ...this.state
    });
  };

  handleKeyUpload = key => event => {
    const file = event.target.files[0];
    const filename = event.target.value.split(/(\\|\/)/g).pop();
    const key_filename = `${key}_filename`;

    let reader = new window.FileReader();
    reader.onload = () => {
      let pub;
      try {
        pub = openpgp.key.readArmored(reader.result).keys[0];

        if (pub.primaryKey.params[0].getName() !== 'secp256k1') {
          this.setState({
            error: `Uploaded key is ${pub.primaryKey.params[0].getName()}, please upload a secp256k1 key`
          });
        } else {
          this.setState({
            error: null,
            [key]: pub.armor(),
            [key_filename]: filename
          });
        }
      } catch (err) {
        this.setState({
          error: 'Uploaded file is not a key.'
        });
      }
    };
    reader.readAsText(file);
  };

  render() {
    const { user, action, classes } = this.props;
    const {
      error,
      primary_key,
      primary_key_filename,
      recovery_key,
      recovery_key_filename,
      email,
      firstName,
      lastName
    } = this.state;

    return (
      <Grid container spacing={16} justify='center'>
        {
          action === 'Register' && <div>
            <Grid item xs={12}>
              <FormControl
                className={classNames(classes.formControl)}
              >
                <InputLabel>First Name</InputLabel>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={this.handleChange('firstName').bind(this)}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl
                className={classNames(classes.formControl)}
              >
                <InputLabel>Last Name</InputLabel>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={this.handleChange('lastName').bind(this)}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl
                className={classNames(classes.formControl)}
              >
                <InputLabel>Email</InputLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={this.handleChange('email').bind(this)}
                />
              </FormControl>
            </Grid>
          </div>
        }
        <Grid container item xs={12} justify='center'>
          <FormControl>
            <input
              id="secKeyFile"
              type="file"
              onChange={this.handleKeyUpload('primary_key').bind(this)}
              style={{
                width: 0,
                height: 0,
                opacity: 0,
                overflow: 'hidden',
                position: 'absolute',
                zIndex: 1
              }}
            />
            <Button
              color="secondary"
              variant="raised"
              component="label"
              htmlFor="secKeyFile"
            >
              {primary_key == null
                ? 'Upload Armored SECP256K1 Primary Key'
                : primary_key_filename}
            </Button>
          </FormControl>
        </Grid>

        <Grid container item xs={12} justify='center'>
          <FormControl>
            <input
              id="secRecoveryKeyFile"
              type="file"
              onChange={this.handleKeyUpload('recovery_key').bind(this)}
              style={{
                width: 0,
                height: 0,
                opacity: 0,
                overflow: 'hidden',
                position: 'absolute',
                zIndex: 1
              }}
            />
            <Button
              color="secondary"
              variant="raised"
              component="label"
              htmlFor="secRecoveryKeyFile"
            >
              {recovery_key == null
                ? 'Upload Armored SECP256K1 Recovery Key'
                : recovery_key_filename}
            </Button>
          </FormControl>
        </Grid>

        <Grid container item xs={12} alignItems='center' justify='center' alignContent='center'>
          <FormControl>
            <Button
              variant="raised"
              color="secondary"
              disabled={
                (primary_key == null || recovery_key == null) && (action === 'Register' && (email == null || firstName == null || lastName == null))
              }
              onClick={this.handleSubmit}
            >
              { action }
          </Button>
          </FormControl>
        </Grid>

        {error !== null && (
          <Grid item xs={12}>
            <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
          </Grid>
        )}

        {user.error !== null && (
          <Grid item xs={12}>
            {user.error.error !== null && <p style={{ color: 'red', textAlign: 'center' }}>{user.error.error}</p>}
            {user.error.message !== null && <p style={{ color: 'red', textAlign: 'center' }}>{user.error.message}</p>}
          </Grid>
        )}
      </Grid>
    );
  }
}

export default withStyles(styles)(KeyUploadForm);
