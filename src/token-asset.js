import React from 'react';
import {
  FormControl,
  FormGroup,
  InputGroup,
  DropdownButton,
  ProgressBar,
  MenuItem,
  Modal,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import * as web3 from '@luhuimao/bitconch-web3j';

import {getTokenAssetByOwnerPublicKey} from './util/read-write-db';

export class TokenAsset extends React.Component {
    state = {
      value: '',
      validationState: null,
      tokenInfo: null,
      tokenNameArray: [],
      busyModal: null,
    };

    constructor(props) {
      super(props);
      // getTokenAssetByOwnerPublicKey(this, this.props.account_pubkey, this.readPublicKeyFromFile);
      this.runModal(
        '数据获取中',
        '请稍后...',
        () => {
          getTokenAssetByOwnerPublicKey(this, this.props.account_pubkey, this.readPublicKeyFromFile);
        }
      );
      this.props.readingDataHold();
    }

    runModal(title, text, f) {
      this.setState({
        busyModal: {title, text},
      });

      try {
        f();
      } catch (err) {
        alert(err.message);
      }

      this.setState({busyModal: null});
    }

    async readPublicKeyFromFile(data, obj) {
      try {
        var i;
        var arrToken = [];
        for(i = 0; i < data.length; i++) {
          var tokenpubkey = new web3.PubKey(data[i][3]);
          var token = new web3.Token(obj.props.conn, tokenpubkey);
          var acc = await token.fetchTokenDetail();
          var tokenname = acc.name;
          var tokensymbol = acc.symbol;
          var tokensupply = acc.supply;
          var tokendecimal = acc.decimals;
          var tokenaccpubkey = data[i][2];
          var accTokenInfo = await token.fetchAccountDetail(new web3.PubKey(tokenaccpubkey.toString()));

          arrToken.push({
            tokenpubkey,
            tokenname,
            tokensymbol,
            tokensupply,
            tokendecimal,
            tokenaccpubkey,
            accTokenInfo
          });
        }
        obj.setState({
          tokenNameArray: arrToken,
        });
      } catch (err)
      {
        alert(err.message);
        obj.addError(err.message);
      }
    }
    async setTokenInfo(token) {
      var tem = '';
      var msg = '';
      var to = new web3.Token(this.props.conn, token.tokenpubkey);
      var tokenacc = await to.fetchAccountDetail(new web3.PubKey(token.tokenaccpubkey));
      String.format = function(src){
        if (arguments.length == 0) return null;
        var args = Array.prototype.slice.call(arguments, 1);
        return src.replace(/\{(\d+)\}/g, function(m, i){
          return args[i];
        });
      };

      // tem += '名称: {0}   ' +
      // '余额: {1}';
      tem += '{0} ' +
      '余额: {1}';
      msg += String.format(
        tem,
        token.tokenname,
        tokenacc.amount
      );
      this.setState({
        tokenInfo: msg,
      });
      this.props.onTokenAsset(token);
    }

    getValidationState(value) {
      const length = value.length;
      if (length === 44) {
        if (value.match(/^[A-Za-z0-9]+$/)) {
          return 'success';
        }
        return 'error';
      } else if (length > 44) {
        return 'error';
      } else if (length > 0) {
        return 'warning';
      }
      return null;
    }

    // handleChange(e) {
    //   const {value} = e.target;
    //   const validationState = this.getValidationState(value);
    //   this.setState({
    //     value: value,
    //     validationState: validationState,
    //   });

    //   this.props.onTokenAsset(validationState === 'success' ? value : null);
    // }

    render() {
      const busyModal = this.state.busyModal ?
        <BusyModal show title={this.state.busyModal.title} text={this.state.busyModal.text} /> : null;
      return (
        <form>
          {busyModal}
          <FormGroup validationState={this.state.validationState} style={{display:'inline-table'}}>
            <FormControl
              readOnly
              type="text"
              size="21"
              value={this.state.tokenInfo}
            />
            <FormControl.Feedback />
            <DropdownButton componentClass={InputGroup.Button} title="资产" onSelect={::this.setTokenInfo}>
              {
                this.state.tokenNameArray.map((obj, index) => <MenuItem key={index} eventKey={obj}>{obj.tokenname}</MenuItem>)
              }
            </DropdownButton>
          </FormGroup>
        </form>
      );
    }
}

TokenAsset.propTypes = {
  onTokenAsset: PropTypes.function,
  conn: PropTypes.object,
  account_pubkey: PropTypes.object,
  readingDataHold: PropTypes.function,
};

class BusyModal extends React.Component {
  render() {
    return (
      <Modal
        {...this.props}
        bsSize="small"
        aria-labelledby="contained-modal-title-sm"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-sm">{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.text}
          <br/>
          <br/>
          <ProgressBar active now={100} />
        </Modal.Body>
      </Modal>
    );
  }
}
BusyModal.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
};