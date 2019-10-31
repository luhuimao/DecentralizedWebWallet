import React from 'react';
import {
  Button,
  FormControl,
  FormGroup,
  Glyphicon,
  InputGroup,
  OverlayTrigger,
  Tooltip,
  ProgressBar,
  Modal,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import * as web3 from '@luhuimao/bitconch-web3j';
import sleep from 'sleep-promise';

// import {sleep} from './util/sleep';
import {AddPropertyModal, PropertyAdd} from './add-asset';
import {TokenAsset} from './token-asset';
import {writeTokenAssetToInfluxdb} from './util/read-write-db';

const transfer_btn_style = {
  opacity: '1 !important',
  marginTop: '12px',
  backgroundColor: '#21ba45',
  // background: 'rgb(230, 230, 230) none repeat scroll 0% 0%',
  color: 'rgb(255, 255, 255)',
  fontWeight: '500',
  letterSpacing: '2px',
  margin: '24px 0px 0px 32px',
  border: '2px solid',
  width: '288px',
  height: '60px',
  borderRadius: '30px',
  fontSize: '18px'
};

export class TransferToken extends React.Component {
    state = {
      busyModal: null,
      tokenName: null,
      tokenAmount: 0,
      sourceTokenAccountPublicKey: null,
      destTokenAccountPublicKey: null,
      transferTokenAmount: 0,
      sourceTokenAccountTokenAmount: 0,
      destTokenAccountTokenAmount: 0,
      tokenObj: null,
      newTokenAccountPublicKey: null,
      addPropertyModal: false,
    };

    setSourceTokenAccountPublicKey(token) {
      var to = new web3.Token(this.props.conn, token.tokenpubkey);
      this.setState({
        sourceTokenAccountPublicKey: token.tokenaccpubkey,
        tokenObj: to
      });
    }

    createNewTokenAccountForSelectedAsset() {
      this.runModal(
        '正在添加',
        '请稍后...',
        async () => {
          const balance = await this.props.conn.fetchAccountBalance(this.props.web3jAccount.pubKey);
          // alert(typeof balance);
          if(this.state.tokenNameArray){
            if (balance > 0) {
              for (var i = 0; i < this.state.tokenNameArray.length; i++) {
                var tokens = this.state.tokenNameArray[i];
                if (tokens.tokenselected == true) {
                  var publickey = new web3.PubKey(tokens.tokenpublickey);
                  var token = new web3.Token(this.props.conn, publickey);
                  const new_token_account_pubkey =await token.createNewAccount(this.props.web3jAccount);
                  writeTokenAssetToInfluxdb(this.props.web3jAccount.pubKey.toString(), tokens.tokenpublickey, new_token_account_pubkey.toString(), this.props.node_host_ip);
                }
              }
              this.props.refeshParentPage(this.props.parentObj);
            }
            else {
              alert('您的余额不足，无法添加资产');
            }
          }
        }
      );
    }

    createNewTokenAccount() {
      this.runModal(
        '创建Token账户',
        '请稍后...',
        async () => {
          var newtokenaccpubkey = await this.state.tokenObj.createNewAccount(this.props.web3jAccount);
          this.setState({
            newTokenAccountPublicKey: newtokenaccpubkey.toString(),
          });
        }
      );
    }

    copyNewTokenAccountPublicKey() {
      if (this.state.newTokenAccountPublicKey) {
        copy(this.state.newTokenAccountPublicKey);
      }
    }

    copySourceTokenAccountPublicKey() {
      if (this.state.sourceTokenAccountPublicKey) {
        copy(this.state.sourceTokenAccountPublicKey);
      }
    }

    async runModal(title, text, f) {
      this.setState({
        busyModal: {title, text},
      });

      try {
        await f();
      } catch (err) {
        alert(err);
        this.addError(err.message);
      }

      this.setState({busyModal: null});
    }

    transferToken() {
      this.runModal(
        '发送Token',
        '请稍后...',
        async () => {
          var sourcetokenacc = await this.state.tokenObj.fetchAccountDetail(new web3.PubKey(this.state.sourceTokenAccountPublicKey));
          if (new Number(sourcetokenacc.amount) < new Number(this.state.transferTokenAmount)) {
            alert('token数量不足，无法完成交易! 当前账户Token数量：' + sourcetokenacc.amount);
            return;
          }

          const sig = await this.state.tokenObj.transfer(
            this.props.web3jAccount,
            new web3.PubKey(this.state.sourceTokenAccountPublicKey),
            new web3.PubKey(this.state.destTokenAccountPublicKey),
            this.state.transferTokenAmount
          );
          await this.props.conn.confmTxn(sig);
          sourcetokenacc = await this.state.tokenObj.fetchAccountDetail(new web3.PubKey(this.state.sourceTokenAccountPublicKey));
          var desttokenacc = await this.state.tokenObj.fetchAccountDetail(new web3.PubKey(this.state.destTokenAccountPublicKey));
          this.setState({
            sourceTokenAccountTokenAmount: sourcetokenacc.amount.toString(),
            destTokenAccountTokenAmount: desttokenacc.amount.toString(),
          });
          alert('发送成功');
        }
      );
    }

    ResetListForPorperty(){
      this.createNewTokenAccountForSelectedAsset();
      this.setState({
        addPropertyModal: false,
      });
    }

    sleeping(n) {
      this.runModal('数据读取中','请稍后...',async () => {await sleep(n*1000);});
    }

    render(){
      const copyTooltip = (
        <Tooltip id="clipboard">
          复制到剪贴板
        </Tooltip>
      );
      const createNewTokenAccounttip = (
        <Tooltip id="newtokenaccount">
          申请Token账户
        </Tooltip>
      );

      const createNewTokenAccountDisabled = this.state.tokenObj === null;
      const transferDisabled = this.state.SourceTokenAccountPubKeyInput === null || this.state.destTokenAccountPublicKey === null || this.state.transferTokenAmount === 0 || this.state.tokenObj === null;
      const busyModal = this.state.busyModal ?
        <BusyModal show title={this.state.busyModal.title} text={this.state.busyModal.text} /> : null;
      const addPropertyModal = this.state.addPropertyModal ?
        <AddPropertyModal
          show
          conn = {this.props.conn}
          tokenarr = {(tokenarr) => {this.setState({tokenNameArray: tokenarr});}}
          addsure = {() => this.ResetListForPorperty()}
          onSelect = {() => this.selectOn()}
          offSelect = {() => this.selectOff()}
          onHide={() => this.setState({addPropertyModal: false})}
          ownerPubkey = {this.props.web3jAccount.pubKey}
        /> : null;
      return(
        <div style={{paddingBottom:'20px'}}>
          {busyModal}
          {addPropertyModal}
          <div style={{paddingBottom: '0px', boxSizing: 'inherit', }}>
            <div style={{textAligh:'center', width:'360px', margin:'0px auto', paddingTop:'0'}}>
              <div id='top' style={{boxSizing: 'inherit',textAligh:'center'}}>
                <div id='topR'>
                  <div className="ui container sc-gqjmRU lkQupP" style={{display: 'block', width: '100%', marginLeft: 'auto !important', marginRight: 'auto !important', maxWidth: '100% !important'}}>
                    <div className="ui grid title-section" style={{marginTop:'-1rem',marginBottom:'-1rem',marginLeft:'-1rem',marginRight:'-1rem'}}>
                      <div className="one column row page-title center" style={{width:'100%',textAlign:'center', marginLeft:'0'}}>
                        <h1 className="title">资产管理
                        </h1>
                      </div>
                    </div>
                  </div>
                  <div className="ui list list-top border" style={{minHeight: '100px',marginTop: '14px',padding: '24px 24px 36px',borderImage: 'none 100% / 1 / 0 stretch',borderWidth: '4px 4px 0px',borderRadius: '8px 8px 0px 0px', borderColor: 'rgb(230, 230, 230)', borderStyle: 'solid solid none'}}>
                    <div className="item" style={{paddingTop: '0'}}>
                      <div className="content">
                        <h3 className="ui header" style={{marginBottom: '13px',textAlign: 'left'}}></h3>
                        <div className="required field sc-jzJRlG ksIrao create problem">
                          <div className="ui input">
                            <PropertyAdd addproperty={() => {this.setState({addPropertyModal: true});}} style={{marginBottom:'5px'}}/>
                            <FormControl readOnly type="text" size="21" value={this.state.sourceTokenAccountPublicKey} style={{display: 'none'}}/>
                            <TokenAsset readingDataHold={() => {this.sleeping(2);}} conn={this.props.conn} account_pubkey={this.props.web3jAccount.pubKey} onTokenAsset={(tokenAccPubkey) => this.setSourceTokenAccountPublicKey(tokenAccPubkey)}/>
                            <h1>付款人账户 </h1>
                            <FormGroup>
                              <InputGroup>
                                <FormControl readOnly type="text" size="21" value={this.state.sourceTokenAccountPublicKey}/>
                                <InputGroup.Button>
                                  <OverlayTrigger placement="bottom" overlay={copyTooltip}>
                                    <Button onClick={() => {this.copySourceTokenAccountPublicKey();}}>
                                      <Glyphicon glyph="copy" />
                                    </Button>
                                  </OverlayTrigger>
                                </InputGroup.Button>
                              </InputGroup>
                            </FormGroup>
                            <DestinationTokenAccountPubKeyInput onDestinationTokenAccountPubKey={(destkey) => this.setState({destTokenAccountPublicKey: destkey})}/>
                            <TransferTokenNumberInput onTransferTokenNumber={(num) => this.setState({transferTokenAmount: num})}/>
                            <div style={{display:'none'}}>
                              <h1>生成代币地址</h1>
                              <FormGroup>
                                <InputGroup>
                                  <FormControl readOnly type="text" size="21" value={this.state.newTokenAccountPublicKey}/>
                                  <InputGroup.Button>
                                    <OverlayTrigger placement="bottom" overlay={copyTooltip}>
                                      <Button onClick={() => {this.copyNewTokenAccountPublicKey();}}>
                                        <Glyphicon glyph="copy" />
                                      </Button>
                                    </OverlayTrigger>
                                  </InputGroup.Button>
                                </InputGroup>
                              </FormGroup>
                            </div>
                            <OverlayTrigger placement="bottom" overlay={createNewTokenAccounttip}>
                              <Button style={{float:'right', display:'none'}} disabled={createNewTokenAccountDisabled}  bsStyle="primary" onClick={() => {this.createNewTokenAccount();}}>
                                <Glyphicon glyph="generate"/>生成
                              </Button>
                            </OverlayTrigger>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id='bottom' style={{oxSizing: 'inherit', textAligh:'center',}}>
                <div className="ui list list-bottom border" style={{borderImage:'none 100% / 1 / 0 stretch',padding: '0px 0px 12px', borderRadius: '0px 0px 8px 8px', borderColor: 'rgb(230, 230, 230)', borderStyle: 'none solid solid', borderWidth: '0px 4px 4px'}}>
                  <div className="item send-money" style={{paddingBottom:'12px',marginTop: '0px', marginBottom: '12px'}}>
                    <Button disabled={transferDisabled} onClick={() => this.transferToken()} style={transfer_btn_style}>发送</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
}
TransferToken.propTypes = {
  conn: PropTypes.object,
  web3jAccount: PropTypes.object,
  refeshParentPage: PropTypes.function,
  parentObj: PropTypes.object,
  node_host_ip: PropTypes.object,
};

class DestinationTokenAccountPubKeyInput extends React.Component {
    state = {
      value: '',
      validationState: null,
    };

    getValidationState(value) {
      const length = value.length;
      if (length === 44 || length === 43) {
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

    handleChange(e) {
      const {value} = e.target;
      const validationState = this.getValidationState(value);
      this.setState({value, validationState});
      this.props.onDestinationTokenAccountPubKey(validationState === 'success' ? value : null);
    }

    render() {
      return (
        <form>
          <FormGroup
            validationState={this.state.validationState}
          >
            <h1>收款人账户</h1>
            <InputGroup style={{display:'flex'}}>
              <FormControl
                type="text"
                id="desttokenaccountpubkey"
                value={this.state.value}
                placeholder="请输入收款人账户地址"
                onChange={(e) => this.handleChange(e)}
              />
              <FormControl.Feedback />
            </InputGroup>

          </FormGroup>
        </form>
      );
    }
}

DestinationTokenAccountPubKeyInput.propTypes = {
  onDestinationTokenAccountPubKey: PropTypes.function,
};

class TransferTokenNumberInput extends React.Component {
    state = {
      value: '',
      validationState: null,
    };

    getValidationState(value) {
      const length = value.length;
      if (length === 0) {
        return null;
      }
      if (value.match(/^\d+$/)) {
        return 'success';
      }
      return 'error';
    }

    handleChange(e) {
      const {value} = e.target;
      const validationState = this.getValidationState(value);
      this.setState({value, validationState});
      this.props.onTransferTokenNumber(validationState === 'success' ? value : null);
    }

    render() {
      return (
        <form>
          <FormGroup
            validationState={this.state.validationState}
          >
            <h1>转账数量</h1>
            <InputGroup style={{display:'flex'}}>
              <FormControl
                type="text"
                value={this.state.value}
                placeholder="请输入转账数量"
                onChange={(e) => this.handleChange(e)}
              />
              <FormControl.Feedback />
            </InputGroup>
          </FormGroup>
        </form>
      );
    }
}
TransferTokenNumberInput.propTypes = {
  onTransferTokenNumber: PropTypes.function,
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