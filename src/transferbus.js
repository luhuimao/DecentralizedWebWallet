import React from 'react';
import {
  Button,
  FormControl,
  FormGroup,
  InputGroup,
  Modal,
  ProgressBar,
  Panel,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import * as web3 from '@luhuimao/bitconch-web3j';

const transfer_btn_style = {
  opacity: '1 !important',
  marginTop: '12px',
  backgroundColor: '#21ba45',
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

export class TransferBus extends React.Component {
    state = {
      recipientPublicKey: null,
      recipientAmount: null,
      busyModal: null,
    };
    sendTransaction() {
      this.runModal(
        '发送交易',
        '请稍后...',
        async () => {
          const transaction = web3.SystemController.transfer(
            this.props.web3jAccount.pubKey,
            new web3.PubKey(this.state.recipientPublicKey),
            this.state.recipientAmount,
          );
          const signature = await this.props.conn.sendTxn(transaction,this.props.web3jAccount);
          await this.props.conn.confmTxn(signature);
          this.setState({
            balance: await this.props.conn.fetchAccountBalance(this.props.web3jAccount.pubKey),
          });
          alert('发送成功');
        }
      );
    }
    render() {
      const sendDisabled = this.state.recipientPublicKey === null || this.state.recipientAmount === null;
      const busyModal = this.state.busyModal ?
        <BusyModal show title={this.state.busyModal.title} text={this.state.busyModal.text} /> : null;
      return (
        <div style={{paddingBottom:'20px'}}>
          {busyModal}
          <Panel style={{display: 'none'}}>
            <Panel.Heading>
              <img src="img/transaction.png"/>
              交易
            </Panel.Heading>
            <Panel.Body>
              <PublicKeyInput onPublicKey={(publicKey) => this.setState({recipientPublicKey: publicKey})}/>
              <TokenInput onAmount={(amount) => this.setState({recipientAmount:amount})}/>
              <div className="text-center">
                <Button disabled={sendDisabled} onClick={() => this.sendTransaction()}>发送</Button>
              </div>
            </Panel.Body>
          </Panel>
          <div style={{paddingBottom: '0px', boxSizing: 'inherit', }}>
            <div style={{textAligh:'center', width:'360px', margin:'0px auto', paddingTop:'0'}}>
              <div id='top' style={{boxSizing: 'inherit',textAligh:'center'}}>
                <div id='topR'>
                  <div className="ui container sc-gqjmRU lkQupP" style={{display: 'block', width: '100%', marginLeft: 'auto !important', marginRight: 'auto !important', maxWidth: '100% !important'}}>
                    <div className="ui grid title-section" style={{marginTop:'-1rem',marginBottom:'-1rem',marginLeft:'-1rem',marginRight:'-1rem'}}>
                      <div className="one column row page-title center" style={{width:'100%',textAlign:'center', marginLeft:'0'}}>
                        <h1 className="title">转账管理
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
                            <PublicKeyInput onPublicKey={(publicKey) => this.setState({recipientPublicKey: publicKey})}/>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="item amount border-top">
                      <div className="sc-jWBwVP bgeZku">
                        <div className="required field">
                          <div className="ui input">
                            <TokenInput onAmount={(amount) => this.setState({recipientAmount:amount})} style={{padding: '0px',textAlign: 'center',color: 'rgb(74, 79, 84)',lineHeight: '80px',fontWeight: '500',fontSize: '72px',fontFamily: 'Bw Seido Round',height: '80px', border: '0px none'}}
                            />
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
                    <Button onClick={() => this.sendTransaction()} disabled={sendDisabled} style={transfer_btn_style}>发送</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
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
}
TransferBus.propTypes = {
  conn: PropTypes.object,
  web3jAccount: PropTypes.object,
};

class PublicKeyInput extends React.Component {
  state = {
    value: '',
    validationState: null,
  };

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

  handleChange(e) {
    const {value} = e.target;
    const validationState = this.getValidationState(value);
    this.setState({value, validationState});
    this.props.onPublicKey(validationState === 'success' ? value : null);
  }

  render() {
    return (
      <form>
        <FormGroup validationState={this.state.validationState}>
          <h1>收款人地址</h1>
          <InputGroup style={{display:'flex'}}>
            <FormControl type="text" value={this.state.value} placeholder="请输入收款人的地址" onChange={(e) => this.handleChange(e)}/>
            <FormControl.Feedback />
          </InputGroup>
        </FormGroup>
      </form>
    );
  }
}
PublicKeyInput.propTypes = {
  onPublicKey: PropTypes.function,
};

class TokenInput extends React.Component {
  state = {
    value: '',
    validationState: null,
  };

  getValidationState(value) {
    if (value.length === 0) {
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
    this.props.onAmount(validationState === 'success' ? value : null);
  }

  render() {
    return (
      <form>
        <FormGroup validationState={this.state.validationState}>
          <h1>数量</h1>
          <InputGroup style={{display:'flex'}}>
            <FormControl type="text" value={this.state.value} placeholder="请输入交易数量" onChange={(e) => this.handleChange(e)}/>
            <FormControl.Feedback />
          </InputGroup>
        </FormGroup>
      </form>
    );
  }
}
TokenInput.propTypes = {
  onAmount: PropTypes.function,
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