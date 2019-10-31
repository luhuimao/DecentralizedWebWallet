import React from 'react';
import {
  Button,
  FormControl,
  FormGroup,
  InputGroup,
  Modal,
  ProgressBar,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import * as web3 from '@luhuimao/bitconch-web3j';

import {writeNewTokenToInfluxdb, writeTokenAssetToInfluxdb} from './util/read-write-db';

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

export class CreateNewToken extends React.Component {
  state = {
    busyModal: null,
    balance: 0,
    tokenSupply: new web3.TokenCount(0),
    tokenName: null,
    tokenSymbol: null,
    tokenDecimal: 0,
    tokenAmount: 0,
    newTokenAcountAddr: null,
    tokenObj: null,
    createdTokenInfoList: [],
    tokenAccountPubkeyList: [],
  };
  createNewToken() {
    this.runModal(
      '创建NewToken',
      '请稍后...',
      async () => {
        const b = await this.props.conn.fetchAccountBalance(this.props.web3jAccount.pubKey);
        if (b <= 0) {
          alert('您的余额不足，无法创建代币');
          return;
        }
        const [token, pubkey] = await web3.Token.createNewToken(
          this.props.conn,
          this.props.web3jAccount,
          this.state.tokenSupply,
          this.state.tokenName,
          this.state.tokenSymbol,
          this.state.tokenDecimal,
        );

        writeNewTokenToInfluxdb(this.props.web3jAccount.pubKey.toString(), token.token.toString(), this.props.node_host_ip);
        writeTokenAssetToInfluxdb(this.props.web3jAccount.pubKey.toString(), token.token.toString(), pubkey.toString(), this.props.node_host_ip);

        this.setState({
          tokenObj: token,
        });
        const newTokenAccountInfo = await token.fetchAccountDetail(pubkey);
        var tokenAmount = newTokenAccountInfo.amount;

        var arr = this.state.createdTokenInfoList;
        arr.push({token, pubkey});
        var arr_pubkey = this.state.tokenAccountPubkeyList;
        arr_pubkey.push(pubkey);
        this.setState({
          tokenAmount: tokenAmount.toString(),
          newTokenAcountAddr: pubkey.toString(),
          createdTokenInfoList: arr,
          tokenAccountPubkeyList: arr_pubkey,
        });
        alert('创建成功');
      }
    );
  }

  async runModal(title, text, f) {
    this.setState({
      busyModal: {title, text},
    });

    try {
      await f();
    } catch (err) {
      this.addError(err.message);
    }

    this.setState({busyModal: null});
  }

  render() {

    const createDisabled = this.state.tokenSupply === 0 || this.state.tokenDecimal === 0 || this.state.tokenName === null || this.state.tokenSymbol ===null;
    const busyModal = this.state.busyModal ?
      <BusyModal show title={this.state.busyModal.title} text={this.state.busyModal.text} /> : null;

    return (
      <div style={{paddingBottom:'20px'}}>
        {busyModal}
        <div style={{/*paddingBottom: '200px',*/ boxSizing: 'inherit', }}>
          <div style={{textAligh:'center', width:'360px', margin:'0px auto', paddingTop:'0'}}>
            <div id='top' style={{boxSizing: 'inherit',textAligh:'center'}}>
              <div id='topR'>
                <div className="ui container sc-gqjmRU lkQupP" style={{display: 'block', width: '100%', marginLeft: 'auto !important', marginRight: 'auto !important', maxWidth: '100% !important'}}>
                  <div className="ui grid title-section" style={{marginTop:'-1rem',marginBottom:'-1rem',marginLeft:'-1rem',marginRight:'-1rem'}}>
                    <div className="one column row page-title center" style={{width:'100%',textAlign:'center', marginLeft:'0'}}>
                      <h1 className="title">创建代币
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
                          <TokenSupplyInput onTokenSupply={(supply) => this.setState({tokenSupply: supply})}/>
                          <TokenNameInput onTokenName={(name) => this.setState({tokenName:name})}/>
                          <TokenSymbolInput onTokenSymbol={(symbol) => this.setState({tokenSymbol: symbol})}/>
                          <TokenDecimalInput onTokenDecimal={(decimal) => this.setState({tokenDecimal: decimal})}/>
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
                  <Button disabled={createDisabled} onClick={() => this.createNewToken() } style={transfer_btn_style}>创建</Button>
                  <Button onClick={() => {alert('锁仓，质押等高级功能,需授权开放,即将在下个版本开放测试,敬请期待');}} style={transfer_btn_style}>高级设定</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
CreateNewToken.propTypes = {
  conn: PropTypes.object,
  web3jAccount: PropTypes.object,
  node_host_ip: PropTypes.object,
};

class TokenSupplyInput extends React.Component {
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
      if (value > 18446744073709551616) {
        return 'error';
      }
      return 'success';
    }
    return 'error';
  }

  handleChange(e) {
    const {value} = e.target;
    const validationState = this.getValidationState(value);
    this.setState({value, validationState});
    this.props.onTokenSupply(validationState === 'success' ? new web3.TokenCount(value) : null);
  }

  render() {
    return (
      <form>
        <FormGroup
          validationState={this.state.validationState}
        >
          <h1>创建数量</h1>
          <InputGroup style={{display:'flex'}}>
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="请输入创建数量"
              onChange={(e) => this.handleChange(e)}
            />
            <FormControl.Feedback />
          </InputGroup>
        </FormGroup>
      </form>
    );
  }
}
TokenSupplyInput.propTypes = {
  onTokenSupply: PropTypes.function,
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

class TokenNameInput extends React.Component {
  state = {
    value: '',
    validationState: null,
  };
  getValidationState(value) {
    const length = value.length;
    if (length > 0) {
      return 'success';
    } else if (length > 44) {
      return 'error';
    }
    return null;
  }

  handleChange(e) {
    const {value} = e.target;
    const validationState = this.getValidationState(value);
    this.setState({value, validationState});
    this.props.onTokenName(validationState === 'success' ? value : null);
  }

  render() {
    return (
      <form>
        <FormGroup
          validationState={this.state.validationState}
        ><h1>名称</h1>
          <InputGroup style={{display:'flex'}}>
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="请输入名称"
              onChange={(e) => this.handleChange(e)}
            />
            <FormControl.Feedback />
          </InputGroup>
        </FormGroup>
      </form>
    );
  }
}
TokenNameInput.propTypes = {
  onTokenName: PropTypes.function,
};

class TokenSymbolInput extends React.Component {
  state = {
    value: '',
    validationState: null,
  };
  getValidationState(value) {
    const length = value.length;
    if (length > 0) {
      return 'success';
    } else if (length > 44) {
      return 'error';
    }
    return null;
  }

  handleChange(e) {
    const {value} = e.target;
    const validationState = this.getValidationState(value);
    this.setState({value, validationState});
    this.props.onTokenSymbol(validationState === 'success' ? value : null);
  }
  render() {
    return (
      <form>
        <FormGroup
          validationState={this.state.validationState}
        >
          <h1>符号</h1>
          <InputGroup style={{display:'flex'}}>
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="请输入符号"
              onChange={(e) => this.handleChange(e)}
            />
            <FormControl.Feedback />
          </InputGroup>
        </FormGroup>
      </form>
    );
  }
}
TokenSymbolInput.propTypes = {
  onTokenSymbol: PropTypes.function,
};

class TokenDecimalInput extends React.Component {
    state = {
      value: '',
      validationState: null,
    };

    getValidationState(value) {
      if (value.length === 0) {
        return null;
      }
      if (value.match(/^\d+$/)) {
        if (value > 255) {
          return 'error';
        }
        return 'success';
      }
      return 'error';
    }

    handleChange(e) {
      const {value} = e.target;
      const validationState = this.getValidationState(value);
      this.setState({value, validationState});
      this.props.onTokenDecimal(validationState === 'success' ? value : null);
    }

    render() {
      return (
        <form>
          <FormGroup
            validationState={this.state.validationState}
          >
            <h1>小数点</h1>
            <InputGroup style={{display:'flex'}}>
              <FormControl
                type="text"
                value={this.state.value}
                placeholder="请输入小数点位数"
                onChange={(e) => this.handleChange(e)}
              />
              <FormControl.Feedback />
            </InputGroup>
          </FormGroup>
        </form>
      );
    }
}
TokenDecimalInput.propTypes = {
  onTokenDecimal: PropTypes.function,
};