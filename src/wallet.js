import React from 'react';
import {
  Alert,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Glyphicon,
  InputGroup,
  Modal,
  OverlayTrigger,
  Panel,
  ProgressBar,
  Tooltip,
  DropdownButton,
  MenuItem,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import * as web3 from '@luhuimao/bitconch-web3j';
import Influx from 'influxdb-nodejs';

import {Settings} from './settings';
import {TransferBus} from './transferbus';
import {CreateNewToken} from './create-new-token';
import {TransferToken} from './transfer-token';
import {AccountInfo} from './accountinfo';
import {DAPP} from './dapp';
import {AdvanceSetting} from './advance-setting';
import Background from './images/account_backgroud.png';

var sectionStyle = {
  height: '150px',
  width: '100%',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  background: `url(${Background})`
};

var topbuttonStyle = {
  padding: '13px 5px',
  width: '19%',
  fondFamily: 'Source Sans Pro',
  textAligh: 'center',
  fontWeigth: '700',
  fontSize: '30px',
  color: '#567fc3',
  textDecoration:'none',
  display:'inline-block',
  boxSizing:'border-box',
  marginBottom:'0'
};

var topbuttonClickedFontStyle = {
  backgroundColor: '#e1ebf9',
  color: '#000',
  padding: '13px 5px',
  width: '19%',
  fondFamily: 'Source Sans Pro',
  textAligh: 'center',
  fontWeigth: '700',
  fontSize: '30px',
  textDecoration:'none',
  display:'inline-block',
  boxSizing:'border-box',
  marginBottom:'0'
};

// var topbuttonClickedFontStyle = {
//   backgroundColor: '#e1ebf9',
//   color: '#000',
//   // fontWeight: '700',
//   textAligh: 'center',
//   // fontSize: '30px'
//   marginBottom:'0'
// };
const AIRDORP_QUOTA = 3000;

const client = new Influx('https://ben:zaq12wsx@metrics.bitconch.org/Tokens');

function writeTokenPubKeyToInfluxdb(owner, tokenpubkey, tokenaccountpubkey) {
  // i --> integer
  // s --> string
  // f --> float
  // b --> boolean
  const fieldSchema = {
    owner_pubkey: 's',
    token_pubkey: 's',
    token_account_pubkey: 's',
  };
  const tagSchema = {
    //
    type: ['1', '2', '3', '4', '5'],
  };
  client.schema('token_account_belong_to_owner', fieldSchema, tagSchema, {
    // default is false
    stripUnknown: true,
  });
  client.write('token_account_belong_to_owner')
  .tag({
    type: '1',
  })
  .field({
    owner_pubkey: owner,
    token_pubkey: tokenpubkey,
    token_account_pubkey: tokenaccountpubkey,
  })
  .then(() => alert('write point success'))
  .catch(console.error);
}

class TokenAsset extends React.Component {
  state = {
    value: '',
    validationState: null,
    tokenInfo: null,
    tokenNameArray: [],
  };

  constructor(props) {
    super(props);
    this.querydb();
  }

  querydb() {
    client.query('token_account_belong_to_owner')
    .where('owner_pubkey', this.props.account_pubkey.toString())
    .then(async (res) =>
    {
      var arr = res.results[0].series[0].values;
      await this.readPublicKeyFromFile(arr);
    }
    )
    .catch(console.error);
  }

  async readPublicKeyFromFile(data) {
    try {
      String.format = function(src){
        if (arguments.length == 0) return null;
        var args = Array.prototype.slice.call(arguments, 1);
        return src.replace(/\{(\d+)\}/g, function(m, i){
          return args[i];
        });
      };
      var i;
      var arrToken = [];
      for(i = 0; i < data.length; i++) {
        var tokenpubkey = new web3.PubKey(data[i][3]);
        var token = new web3.Token(this.props.conn, tokenpubkey);
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
      this.setState({
        tokenNameArray: arrToken,
      });
    } catch (err)
    {
      alert(err.message);
      this.addError(err.message);
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

    tem += '代币名称: {0}   ' +
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

  handleChange(e) {
    const {value} = e.target;
    const validationState = this.getValidationState(value);
    this.setState({
      value: value,
      validationState: validationState,
    });

    this.props.onTokenAsset(validationState === 'success' ? value : null);
  }

  render() {
    return (
      <form>
        <FormGroup
          validationState={this.state.validationState}
        >
          {/* <ControlLabel>资产</ControlLabel> */}
          <DropdownButton
            componentClass={InputGroup.Button}
            title="资产"
            onSelect={::this.setTokenInfo}
          >
            {
              this.state.tokenNameArray.map((obj, index) => <MenuItem key={index} eventKey={obj}>{obj.tokenname}</MenuItem>)
            }
          </DropdownButton>
          <FormControl
            readOnly
            type="text"
            size="21"
            value={this.state.tokenInfo}
          />
          <FormControl.Feedback />
        </FormGroup>
      </form>
    );
  }
}

TokenAsset.propTypes = {
  onTokenAsset: PropTypes.function,
  conn: PropTypes.object,
  account_pubkey: PropTypes.object,
};

class SourceTokenAccountPubKeyInput extends React.Component {
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
    this.props.onSourceTokenAccountPubKey(validationState === 'success' ? value : null);
  }

  render() {
    return (
      <form>
        <FormGroup
          validationState={this.state.validationState}
        >
          <ControlLabel>源地址</ControlLabel>
          <InputGroup>
            <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/send_token.png"/></InputGroup.Addon>
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="请输入源地址"
              onChange={(e) => this.handleChange(e)}
            />
            <FormControl.Feedback />
          </InputGroup>
        </FormGroup>
      </form>
    );
  }
}

SourceTokenAccountPubKeyInput.propTypes = {
  onSourceTokenAccountPubKey: PropTypes.function,
  tokenObj: PropTypes.object,
};

class DestinationTokenAccountPubKeyInput extends React.Component {
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
    this.props.onDestinationTokenAccountPubKey(validationState === 'success' ? value : null);
  }

  render() {
    return (
      <form>
        <FormGroup
          validationState={this.state.validationState}
        >
          <ControlLabel>目标地址</ControlLabel>
          <InputGroup>
            <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/receive_token.png"/></InputGroup.Addon>
            <FormControl
              type="text"
              id="desttokenaccountpubkey"
              value={this.state.value}
              placeholder="请输入目标地址"
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

class SercetkeyInput extends React.Component {
  state = {
    value: '',
    validationState: null,
  };

  getValidationState(value) {
    var array = value.split(',');
    if (array.length === 64) {
      return 'success';
    }else if (array.length <= 64){
      return 'warning';
    }else if (array.length > 64){
      return 'error';
    }else{
      return null;
    }
  }
  handleChange(e) {
    const {value} = e.target;
    const validationState = this.getValidationState(value);
    this.setState({value, validationState});
    this.props.onSercetkey(validationState === 'success' ? value : null);
  }

  render() {
    return (
      <form>
        <FormGroup validationState={this.state.validationState}>
          <FormControl
            type="text"
            value={this.state.value}
            placeholder="请输入您的密钥"
            onChange={e => this.handleChange(e)}
          />
          <FormControl.Feedback />
        </FormGroup>
      </form>
    );
  }
}
SercetkeyInput.propTypes = {
  onSercetkey: PropTypes.function,
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
          <ControlLabel>转账数量</ControlLabel>
          <InputGroup>
            <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_num.png"/></InputGroup.Addon>
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
          <ControlLabel>创建数量</ControlLabel>
          <InputGroup>
            <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_num.png"/></InputGroup.Addon>
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
          <ControlLabel>小数点</ControlLabel>
          <InputGroup>
            <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_decimal.png"/></InputGroup.Addon>
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

class TokenNameInput extends React.Component {
  state = {
    value: '',
    validationState: null,
  };
  getValidationState(value) {
    const length = value.length;
    // if (length === 0) {
    //   return 'bitconch';
    // }
    // if (value.match(/^[A-Za-z0-9]+$/)) {
    //   return 'success';
    // }
    // if (length > 44) {
    //   return 'error';
    // }
    // return null;
    if (length > 0) {
      // if (value.match(/^[A-Za-z0-9]+$/)) {
      //   return 'success';
      // }
      // return 'error';
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
        >
          <ControlLabel>名称</ControlLabel>
          <InputGroup>
            <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_name.png"/></InputGroup.Addon>
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
      // if (value.match(/^[A-Za-z0-9]+$/)) {
      //   return 'success';
      // }
      // return 'error';
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
          <ControlLabel>符号</ControlLabel>
          <InputGroup>
            <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_symbol.png"/></InputGroup.Addon>
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
          <ControlLabel>收款人地址</ControlLabel>
          <InputGroup>
            <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/receive_token.png"/></InputGroup.Addon>
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
          <ControlLabel>数量</ControlLabel>
          <InputGroup>
            <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_num.png"/></InputGroup.Addon>
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


class SignatureInput extends React.Component {
  state = {
    value: '',
    validationState: null,
  };

  getValidationState(value) {
    const length = value.length;
    if (length === 88) {
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
    this.props.onSignature(validationState === 'success' ? value : null);
  }

  render() {
    return (
      <form>
        <FormGroup validationState={this.state.validationState}>
          <ControlLabel>签名</ControlLabel>
          <FormControl type="text" value={this.state.value} placeholder="请输入签名" onChange={(e) => this.handleChange(e)}/>
          <FormControl.Feedback />
        </FormGroup>
      </form>
    );
  }
}
SignatureInput.propTypes = {
  onSignature: PropTypes.function,
};


class DismissibleErrors extends React.Component {
  render() {
    const errs = this.props.errors.map((err, index) => {
      return <Alert key={index} bsStyle="danger">
        <a href="#" onClick={() => this.props.onDismiss(index)}><Glyphicon glyph="remove-sign" /></a> &nbsp;
        {err}
      </Alert>;
    });
    return (
      <div>
        {errs}
      </div>
    );
  }
}
DismissibleErrors.propTypes = {
  errors: PropTypes.array,
  onDismiss: PropTypes.function,
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

class ExportSercetModal extends React.Component {
  render() {
    return (
      <Modal {...this.props} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">切换账户</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <Panel>
              <Panel.Heading>导入密钥</Panel.Heading>
              <Panel.Body>
                <FormGroup>
                  <SercetkeyInput onSercetkey={key => this.props.exsecretkey(key)}/>
                  <Button onClick={() => this.props.updateaccount()}>
                    <Glyphicon glyph="import" />
                    导入
                  </Button>
                </FormGroup>
              </Panel.Body>
            </Panel>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>关闭</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ExportSercetModal.propTypes = {
  exsecretkey: PropTypes.function,
  onHide: PropTypes.function,
  updateaccount:PropTypes.function,
};

class SettingsModal extends React.Component {
  render() {
    return (
      <Modal {...this.props} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">设置</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{padding:'0px'}}>
          <Settings store={this.props.store} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>关闭</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
SettingsModal.propTypes = {
  onHide: PropTypes.function,
  store: PropTypes.object,
};


export class Wallet extends React.Component {
  state = {
    errors: [],
    busyModal: null,
    settingsModal: false,
    exportSercetModal:false,
    mysecretKey:null,
    balance: 0,
    recipientPublicKey: null,
    recipientAmount: null,
    confirmationSignature: null,
    transactionConfirmed: null,
    tokenSupply: new web3.TokenCount(0),
    tokenName: null,
    tokenSymbol: null,
    tokenDecimal: 0,
    tokenAmount: 0,
    newTokenAcountAddr: null,
    sourceTokenAccountPublicKey: null,
    destTokenAccountPublicKey: null,
    transferTokenAmount: 0,
    sourceTokenAccountTokenAmount: 0,
    destTokenAccountTokenAmount: 0,
    tokenObj: null,
    newTokenAccountPublicKey: null,
    createdTokenInfoList: [],
    tokenAccountPubkeyList: [],
    tokenInfoInnerHtml: null,
    tokenNameArray: [],
    showTransferTokenPanel: false,
    showCreateNewTokenPanel: false,
    showTransferBusPanel: false,
    showAccountInfoPanel:true,
    showDappPanel:false,
    showAdvanceSettingPanel: false,
    show_mobile_nav_panel: 'none',
    accountinfo_btn_style: topbuttonClickedFontStyle,
    transfer_bus_btn_style: topbuttonStyle,
    create_new_token_btn_style: topbuttonStyle,
    transfer_token_btn_style: topbuttonStyle,
    dapp_btn_style: topbuttonStyle,
    advance_setting_btn_style: topbuttonStyle,
    mobile_navbar_accountinfo_classname:'link-text-center-v-selected',
    mobile_navbar_transfertoken_classname:'link-text-center-v',
    mobile_navbar_transferbus_classname:'link-text-center-v',
    mobile_navbar_createnewtoken_classname:'link-text-center-v',
    mobile_navbar_dapp_classname:'link-text-center-v',
    mobile_navbar_advance_setting_classname: 'link-text-center-v',
  };

  constructor(props) {
    super(props);
    this.onStoreChange();
  }

  setConfirmationSignature(confirmationSignature) {
    this.setState({
      transactionConfirmed: null,
      confirmationSignature
    });
  }

  setSourceTokenAccountPublicKey(token) {
    var to = new web3.Token(this.web3sol, token.tokenpubkey);
    this.setState({
      sourceTokenAccountPublicKey: token.tokenaccpubkey,
      tokenObj: to
    });  }

  setDestTokenAccountPublicKey(destTokenAccountPublicKey) {
    this.setState({destTokenAccountPublicKey});
  }

  setTransferTokenAmount(transferTokenAmount) {
    this.setState({transferTokenAmount});
  }

  setTokenSupply(tokenSupply) {
    this.setState({tokenSupply});
  }
  setTokenName(tokenName) {
    this.setState({tokenName});
  }

  setTokenSymbol(tokenSymbol) {
    this.setState({tokenSymbol});
  }

  setTokenDecimal(tokenDecimal) {
    this.setState({tokenDecimal});
  }

  setRecipientPublicKey(recipientPublicKey) {
    this.setState({recipientPublicKey});
  }

  setRecipientAmount(recipientAmount) {
    this.setState({recipientAmount});
  }

  dismissError(index) {
    const {errors} = this.state;
    errors.splice(index, 1);
    this.setState({errors});
  }

  addError(message) {
    const {errors} = this.state;
    errors.push(message);
    this.setState({errors});
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

  onStoreChange = () => {
    this.web3solAccount = new web3.BusAccount(this.props.store.accountSecretKey);
    this.web3sol = new web3.Connection(this.props.store.networkEntryPoint);
    this.forceUpdate();
  }

  componentDidMount() {
    this.props.store.onChange(this.onStoreChange);
    this.refreshBalance();
  }

  componentWillUnmount() {
    this.props.store.removeChangeListener(this.onStoreChange);
  }

  setMySerectkey(mysecretKey){
    this.setState({mysecretKey});
  }

  async getAcount(){
    let str = this.state.mysecretKey;
    var array = str.split(',');
    if (array.length === 64) {
      var typedArray = new Uint8Array(array);
      await this.props.store.exportAccount(typedArray);
      this.refreshBalance();
      this.setState({exportSercetModal:false});
    }
  }

  copyPublicKey() {
    copy(this.web3solAccount.pubKey);
  }

  copyTokenAccountPublicKey() {
    copy(this.state.newTokenAcountAddr);
  }

  copyNewTokenAccountPublicKey() {
    copy(this.state.newTokenAccountPublicKey);
  }

  createNewTokenAccount() {
    this.runModal(
      '创建Token账户',
      '请稍后...',
      async () => {
        var newtokenaccpubkey = await this.state.tokenObj.createNewAccount(this.web3solAccount);
        this.setState({
          newTokenAccountPublicKey: newtokenaccpubkey.toString(),
        });
      }
    );
  }

  refreshBalance() {
    this.runModal(
      '更新账户余额',
      '请稍后...',
      async () => {
        this.setState({
          balance: await this.web3sol.fetchAccountBalance(this.web3solAccount.pubKey),
        });
      }
    );
  }

  requestAirdrop() {
    this.runModal(
      '申请空投',
      '请稍后...',
      async () => {
        await this.web3sol.reqDrone(this.web3solAccount.pubKey, AIRDORP_QUOTA);
        this.setState({
          balance: await this.web3sol.fetchAccountBalance(this.web3solAccount.pubKey),
        });
      }
    );
  }

  sendTransaction() {
    this.runModal(
      '发送交易',
      '请稍后...',
      async () => {
        const transaction = web3.SystemController.transfer(
          this.web3solAccount.pubKey,
          new web3.PubKey(this.state.recipientPublicKey),
          this.state.recipientAmount,
        );
        const signature = await this.web3sol.sendTxn(transaction,this.web3solAccount);

        await this.web3sol.confmTxn(signature);
        this.setState({
          balance: await this.web3sol.fetchAccountBalance(this.web3solAccount.pubKey),
        });
      }
    );
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
          this.web3solAccount,
          new web3.PubKey(this.state.sourceTokenAccountPublicKey),
          new web3.PubKey(this.state.destTokenAccountPublicKey),
          this.state.transferTokenAmount
        );
        await this.web3sol.confmTxn(sig);
        sourcetokenacc = await this.state.tokenObj.fetchAccountDetail(new web3.PubKey(this.state.sourceTokenAccountPublicKey));
        var desttokenacc = await this.state.tokenObj.fetchAccountDetail(new web3.PubKey(this.state.destTokenAccountPublicKey));
        this.setState({
          sourceTokenAccountTokenAmount: sourcetokenacc.amount.toString(),
          destTokenAccountTokenAmount: desttokenacc.amount.toString(),
        });
      }
    );
  }

  createNewToken() {
    this.runModal(
      '创建NewToken',
      '请稍后...',
      async () => {
        const b = await this.web3sol.fetchAccountBalance(this.web3solAccount.pubKey);
        if (b <= 0) {
          alert('账户余额不足，无法发送交易！');
          return;
        }
        const [token, pubkey] = await web3.Token.createNewToken(
          this.web3sol,
          this.web3solAccount,
          this.state.tokenSupply,
          this.state.tokenName,
          this.state.tokenSymbol,
          this.state.tokenDecimal,
        );
        writeTokenPubKeyToInfluxdb(this.web3solAccount.pubKey.toString(), token.token.toString(), pubkey.toString());

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
      }
    );
  }

  resetAccount() {
    this.runModal(
      '申请新账户',
      '请稍后...',
      async () => {
        await this.props.store.createAccount();
        this.setState({
          balance: await this.web3sol.fetchAccountBalance(this.web3solAccount.pubKey),
        });
      }
    );
  }

  exportPrivateKey() {
    copy(this.web3solAccount.privateKey);
  }


  confirmTransaction() {
    this.runModal(
      '交易确认',
      '请稍后...',
      async () => {
        const result = await this.web3sol.confmTxn(
          this.state.confirmationSignature,
        );
        this.setState({
          transactionConfirmed: result
        });
      }
    );
  }
  onAccountInfoBtnClick() {
    this.setState({
      showTransferTokenPanel: false,
      showCreateNewTokenPanel: false,
      showTransferBusPanel: false,
      showAccountInfoPanel:true,
      showDappPanel: false,
      showAdvanceSettingPanel: false,
      show_mobile_nav_panel: 'none',
      accountinfo_btn_style: topbuttonClickedFontStyle,
      transfer_bus_btn_style: topbuttonStyle,
      create_new_token_btn_style: topbuttonStyle,
      transfer_token_btn_style: topbuttonStyle,
      dapp_btn_style: topbuttonStyle,
      advance_setting_btn_style: topbuttonStyle,
      mobile_navbar_accountinfo_classname: 'link-text-center-v-selected',
      mobile_navbar_createnewtoken_classname: 'link-text-center-v',
      mobile_navbar_transferbus_classname: 'link-text-center-v',
      mobile_navbar_transfertoken_classname: 'link-text-center-v',
      mobile_navbar_dapp_classname: 'link-text-center-v',
      mobile_navbar_advance_setting_classname: 'link-text-center-v',
    });
  }
  onTransferBusBtnClick() {
    this.setState({
      showTransferTokenPanel: false,
      showCreateNewTokenPanel: false,
      showTransferBusPanel: true,
      showAccountInfoPanel:false,
      showDappPanel: false,
      showAdvanceSettingPanel: false,
      show_mobile_nav_panel: 'none',
      accountinfo_btn_style: topbuttonStyle,
      transfer_bus_btn_style: topbuttonClickedFontStyle,
      create_new_token_btn_style: topbuttonStyle,
      transfer_token_btn_style: topbuttonStyle,
      dapp_btn_style: topbuttonStyle,
      advance_setting_btn_style: topbuttonStyle,
      mobile_navbar_accountinfo_classname: 'link-text-center-v',
      mobile_navbar_createnewtoken_classname: 'link-text-center-v',
      mobile_navbar_transferbus_classname: 'link-text-center-v-selected',
      mobile_navbar_transfertoken_classname: 'link-text-center-v',
      mobile_navbar_dapp_classname: 'link-text-center-v',
      mobile_navbar_advance_setting_classname: 'link-text-center-v',
    });
  }
  onCreateNewTokenBtnClick() {
    this.setState({
      showTransferTokenPanel: false,
      showCreateNewTokenPanel: true,
      showTransferBusPanel: false,
      showAccountInfoPanel:false,
      showDappPanel: false,
      showAdvanceSettingPanel: false,
      show_mobile_nav_panel: 'none',
      accountinfo_btn_style: topbuttonStyle,
      transfer_bus_btn_style: topbuttonStyle,
      create_new_token_btn_style: topbuttonClickedFontStyle,
      transfer_token_btn_style: topbuttonStyle,
      dapp_btn_style: topbuttonStyle,
      advance_setting_btn_style: topbuttonStyle,
      mobile_navbar_accountinfo_classname: 'link-text-center-v',
      mobile_navbar_createnewtoken_classname: 'link-text-center-v-selected',
      mobile_navbar_transferbus_classname: 'link-text-center-v',
      mobile_navbar_transfertoken_classname: 'link-text-center-v',
      mobile_navbar_dapp_classname: 'link-text-center-v',
      mobile_navbar_advance_setting_classname: 'link-text-center-v',
    });
  }
  onTransferTokenBtnClick() {
    this.setState({
      showTransferTokenPanel: true,
      showCreateNewTokenPanel: false,
      showTransferBusPanel: false,
      showAccountInfoPanel:false,
      showDappPanel: false,
      showAdvanceSettingPanel: false,
      show_mobile_nav_panel: 'none',
      accountinfo_btn_style: topbuttonStyle,
      transfer_bus_btn_style: topbuttonStyle,
      create_new_token_btn_style: topbuttonStyle,
      transfer_token_btn_style: topbuttonClickedFontStyle,
      dapp_btn_style: topbuttonStyle,
      advance_setting_btn_style: topbuttonStyle,
      mobile_navbar_accountinfo_classname: 'link-text-center-v',
      mobile_navbar_createnewtoken_classname: 'link-text-center-v',
      mobile_navbar_transferbus_classname: 'link-text-center-v',
      mobile_navbar_transfertoken_classname: 'link-text-center-v-selected',
      mobile_navbar_dapp_classname:'link-text-center-v',
      mobile_navbar_advance_setting_classname: 'link-text-center-v',
    });
  }

  onAdvanceSettingBtnClick() {
    this.setState({
      showTransferTokenPanel: false,
      showCreateNewTokenPanel: false,
      showTransferBusPanel: false,
      showAccountInfoPanel:false,
      showDappPanel: false,
      showAdvanceSettingPanel: true,
      show_mobile_nav_panel: 'none',
      accountinfo_btn_style: topbuttonStyle,
      transfer_bus_btn_style: topbuttonStyle,
      create_new_token_btn_style: topbuttonStyle,
      transfer_token_btn_style: topbuttonStyle,
      dapp_btn_style: topbuttonStyle,
      advance_setting_btn_style: topbuttonClickedFontStyle,
      mobile_navbar_accountinfo_classname: 'link-text-center-v',
      mobile_navbar_createnewtoken_classname: 'link-text-center-v',
      mobile_navbar_transferbus_classname: 'link-text-center-v',
      mobile_navbar_transfertoken_classname: 'link-text-center-v',
      mobile_navbar_dapp_classname:'link-text-center-v',
      mobile_navbar_advance_setting_classname: 'link-text-center-v-selected',
    });
  }

  refreshCurrentPage(obj) {
    window.location.reload();
    obj.onTransferTokenBtnClick();
  }

  onDappBtnClick() {
    this.setState({
      showTransferTokenPanel: false,
      showCreateNewTokenPanel: false,
      showTransferBusPanel: false,
      showAccountInfoPanel:false,
      showDappPanel:true,
      showAdvanceSettingPanel: false,
      show_mobile_nav_panel: 'none',
      accountinfo_btn_style: topbuttonStyle,
      transfer_bus_btn_style: topbuttonStyle,
      create_new_token_btn_style: topbuttonStyle,
      transfer_token_btn_style: topbuttonStyle,
      dapp_btn_style: topbuttonClickedFontStyle,
      advance_setting_btn_style: topbuttonStyle,
      mobile_navbar_accountinfo_classname: 'link-text-center-v',
      mobile_navbar_createnewtoken_classname: 'link-text-center-v',
      mobile_navbar_transferbus_classname: 'link-text-center-v',
      mobile_navbar_transfertoken_classname: 'link-text-center-v',
      mobile_navbar_dapp_classname:'link-text-center-v-selected',
      mobile_navbar_advance_setting_classname: 'link-text-center-v',
    });
  }

  onMobileNavbarClick() {
    if (this.state.show_mobile_nav_panel === 'none') {
      this.setState({
        show_mobile_nav_panel: '',
      });
    }
    else {
      this.setState({
        show_mobile_nav_panel: 'none',
      });
    }
  }

  render() {
    const copyTooltip = (
      <Tooltip id="clipboard">
        复制到剪贴板
      </Tooltip>
    );
    const refreshBalanceTooltip = (
      <Tooltip id="refresh">
        更新账户余额
      </Tooltip>
    );
    const airdropTooltip = (
      <Tooltip id="airdrop">
        申请空投
      </Tooltip>
    );
    const resetTooltip = (
      <Tooltip id="resetaccount">
        申请新账户
      </Tooltip>
    );
    const exportTooltip = (
      <Tooltip id="exportprivate">
        导出密钥(复制到剪贴板)
      </Tooltip>
    );
    const changeTooltip = (
      <Tooltip id="importprivate">
        切换账户(导入密钥)
      </Tooltip>
    );
    const createNewTokenAccounttip = (
      <Tooltip id="newtokenaccount">
        申请Token账户
      </Tooltip>
    );

    const busyModal = this.state.busyModal ?
      <BusyModal show title={this.state.busyModal.title} text={this.state.busyModal.text} /> : null;
    const exportSercetModal = this.state.exportSercetModal ? (
      <ExportSercetModal
        show
        onHide={() => this.setState({exportSercetModal: false})}
        updateaccount={() => this.getAcount()}
        exsecretkey={key => this.setMySerectkey(key)}
      />
    ) : null;
    const settingsModal = this.state.settingsModal ?
      <SettingsModal show store={this.props.store} onHide={() => this.setState({settingsModal: false})}/> : null;

    const sendDisabled = this.state.recipientPublicKey === null || this.state.recipientAmount === null;
    const createDisabled = this.state.tokenSupply === 0 || this.state.tokenDecimal === 0 || this.state.tokenName === null || this.state.tokenSymbol ===null;
    const airdropDisabled = this.state.balance !== 0;
    const transferDisabled = this.state.SourceTokenAccountPubKeyInput === null || this.state.destTokenAccountPublicKey === null || this.state.transferTokenAmount === 0 || this.state.tokenObj === null;
    const createNewTokenAccountDisabled = this.state.tokenObj === null;
    const nodeip = this.props.store.networkEntryPoint.split('//')[1].split(':')[0];
    const transferBus = this.state.showTransferBusPanel ?
      <TransferBus conn={this.web3sol} web3jAccount={this.web3solAccount}/> : null;
    const create_new_token = this.state.showCreateNewTokenPanel ?
      <CreateNewToken node_host_ip={nodeip} conn={this.web3sol} web3jAccount={this.web3solAccount}/> : null;
    const transfer_token = this.state.showTransferTokenPanel ?
      <TransferToken node_host_ip = {nodeip} refeshParentPage={this.refreshCurrentPage} parentObj={this} conn={this.web3sol} web3jAccount={this.web3solAccount}/> : null;
    const account_info = this.state.showAccountInfoPanel ?
      <AccountInfo balance={this.state.balance} store={this.props.store} conn={this.web3sol} web3jAccount={this.web3solAccount}/> : null;
    const dapp = this.state.showDappPanel ?
      <DAPP/> : null;
    const advance_setting = this.state.showAdvanceSettingPanel ?
      <AdvanceSetting/> : null;
    return (
      <div>
        {busyModal}
        {settingsModal}
        {exportSercetModal}
        <DismissibleErrors errors={this.state.errors} onDismiss={(index) => this.dismissError(index)}/>
        <div style={sectionStyle}>
          <div style={{'padding': '45px 0 15px 0',alignItems:'left', display:'flex', boxSizing:'border-box'}}>
            <img src={require('./images/bus_white.png')} className="top-logo-img" /*style={{marginLeft:'30px', 'marginRight':'20px', width:'60px',height:'60px'}}*//>
            <a className="top-logo-text" /*style={{textDecoration:'none',whiteSpace:'nowrap',marginRight:'1rem',paddingTop:'.3125rem',paddingBottom:'.3125rem',display:'inline-block',fontFamily:'Source Sans Pro', fontWeight:'600', textAligh:'left', fontSize:'45px', color:'#FFFFFF', href: '/'}}*/>区块链后台管理</a>
          </div>
        </div>

        <div className="desktopOnly" style={{backgroundColor:'#fefeff',height:'', whiteSpace:'nowrap', boxSizing:'border-box'}}>
          <div style={{textAlign:'center',whiteSpace:'nowrap',overflowX:'',maxWidth:'100%', margin:'0 5%', display:'flex', padding:'0'}}>
            <a style={this.state.accountinfo_btn_style} onClick={() => this.onAccountInfoBtnClick()}><p>账户信息</p></a>
            <a style={this.state.transfer_bus_btn_style} onClick={() => this.onTransferBusBtnClick()}><p>BR交易</p></a>
            <a style={this.state.create_new_token_btn_style} onClick={() => this.onCreateNewTokenBtnClick()}><p>创建代币</p></a>
            <a style={this.state.transfer_token_btn_style} onClick={() => this.onTransferTokenBtnClick()}><p>资产管理</p></a>
            <a style={this.state.dapp_btn_style} onClick={() => this.onDappBtnClick()}><p>分布式应用</p></a>
          </div>
        </div>

        <div className="mobileOnly">
          <button onClick={() => this.onMobileNavbarClick()} className="navbar-toggler">
            <spn className="navbar-toggler-icon" ></spn>
          </button>
        </div>
        <div style={{display:this.state.show_mobile_nav_panel}} className="bottom-line">
          <div className="link-wrapp">
            <a className={this.state.mobile_navbar_accountinfo_classname} onClick={() => this.onAccountInfoBtnClick()}>
              <p>账户信息</p>
            </a>
            <a className={this.state.mobile_navbar_transferbus_classname} onClick={() => this.onTransferBusBtnClick()}>
              <p>BR交易</p>
            </a>
            <a className={this.state.mobile_navbar_createnewtoken_classname} onClick={() => this.onCreateNewTokenBtnClick()}>
              <p>创建代币</p>
            </a>
            <a className={this.state.mobile_navbar_transfertoken_classname} onClick={() => this.onTransferTokenBtnClick()}>
              <p>资产管理</p>
            </a>
            <a className={this.state.mobile_navbar_dapp_classname} onClick={() => this.onDappBtnClick()}>
              <p>分布式应用</p>
            </a>
          </div>
        </div>
        <p/>
        {account_info}
        {transferBus}
        {create_new_token}
        {transfer_token}
        {dapp}
        {advance_setting}
        <footer>
          <div className="footer">
            <div style={sectionStyle}>
              <div className="head-footer" style={{display:'flex',paddingLeft:'13px', paddingTop: '13px', paddingBottom: '13px', fontFamily:'Source Sans Pro'}}>
                <p className="footer-title">Copyright © 2018. 区块链后台管理</p>
                <div>
                  <a href="https://weibo.com/bitconch"></a>
                  <a  href="https://github.com/bitconch/bitconch-core"></a>
                  <a  href="facebook.com/bcoo.chain.5"></a>
                  <a  href="twitter.com/bitconch"></a>
                </div>
              </div>
              <div style={{color: 'rgb(255, 255, 255)',paddingLeft:'13px'}}>
              区块链团队2017年成立于美国，2018年2月正式落户于上海。高管团队由来自硅谷的资深专家组成，研发团队由来自谷歌和IBM的精英团队构成，是一款专注于分布式商业应用的公链。
              </div>
            </div>
          </div>
        </footer>
        <Panel style={{display: 'none'}}>
          <Panel.Heading>
            <img src="img/account_info.png"/>
            账户信息
            <Button onClick={() => this.setState({settingsModal: true})} bsSize="small" bsStyle="primary" style={{float: 'right'}}>
              <Glyphicon glyph="cog"/>
            </Button>
          </Panel.Heading>
          <Panel.Body>
            <div>
              账户地址:
            </div>
            <FormGroup>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/account.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value={this.web3solAccount.pubKey}/>
                <InputGroup.Button>
                  <OverlayTrigger placement="bottom" overlay={copyTooltip}>
                    <Button onClick={() => this.copyPublicKey()}>
                      <Glyphicon glyph="copy" />
                    </Button>
                  </OverlayTrigger>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
            <p/>
            账户余额: {this.state.balance}&nbsp;BUS &nbsp;
            <OverlayTrigger placement="top" overlay={refreshBalanceTooltip}>
              <Button onClick={() => this.refreshBalance()}>
                <Glyphicon glyph="refresh" />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="bottom" overlay={airdropTooltip}>
              <Button disabled={airdropDisabled} onClick={() => this.requestAirdrop()}>
                <Glyphicon glyph="arrow-down" />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="bottom" overlay={resetTooltip}>
              <Button bsStyle="danger" onClick={() => this.resetAccount()}>
                <Glyphicon glyph="repeat" />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="bottom" overlay={exportTooltip}>
              <Button  onClick={() => this.exportPrivateKey()} style={{float: 'right'}}>
                <Glyphicon glyph="export" />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="bottom" overlay={changeTooltip}>
              <Button  onClick={() => this.setState({exportSercetModal: true})} style={{float: 'right'}}>
                <Glyphicon glyph="import" />
              </Button>
            </OverlayTrigger>
          </Panel.Body>
        </Panel>
        <Panel style={{display: 'none'}}>
          <Panel.Heading>
            <img src="img/transaction.png"/>
            交易
          </Panel.Heading>
          <Panel.Body>
            <PublicKeyInput onPublicKey={(publicKey) => this.setRecipientPublicKey(publicKey)}/>
            <TokenInput onAmount={(amount) => this.setRecipientAmount(amount)}/>
            <div className="text-center">
              <Button disabled={sendDisabled} onClick={() => this.sendTransaction()}>发送</Button>
            </div>
          </Panel.Body>
        </Panel>
        <p/>
        <Panel style={{display: 'none'}}>
          <Panel.Heading>
            <img src="img/new_token.png"/>
            创建代币
          </Panel.Heading>
          <Panel.Body>
            <TokenSupplyInput onTokenSupply={(supply) => this.setTokenSupply(supply)}/>
            <TokenNameInput onTokenName={(name) => this.setTokenName(name)}/>
            <TokenSymbolInput onTokenSymbol={(symbol) => this.setTokenSymbol(symbol)}/>
            <TokenDecimalInput onTokenDecimal={(decimal) => this.setTokenDecimal(decimal)}/>
            <p/>
            NewToken存放账户地址:
            <FormGroup>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_account.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value={this.state.newTokenAcountAddr}/>
                <InputGroup.Button>
                  <OverlayTrigger placement="bottom" overlay={copyTooltip}>
                    <Button onClick={() => this.copyTokenAccountPublicKey()}>
                      <Glyphicon glyph="copy" />
                    </Button>
                  </OverlayTrigger>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
            <p/>
            Token数量: {this.state.tokenAmount}&nbsp;
            <p/>
            <div className="text-center">
              <Button disabled={createDisabled} onClick={() => this.createNewToken()}>创建</Button>
            </div>
          </Panel.Body>
        </Panel>
        <p/>
        <Panel style={{display: 'none'}}>
          <Panel.Heading>
            <img src="img/transfer_token.png"/>
            发送代币
          </Panel.Heading>
          <Panel.Body>
          源地址:
            <p/>
            <FormControl readOnly type="text" size="21" value={this.state.sourceTokenAccountPublicKey}/>
            <DestinationTokenAccountPubKeyInput onDestinationTokenAccountPubKey={(destkey) => this.setDestTokenAccountPublicKey(destkey)}/>
            <TokenAsset conn={this.web3sol} account_pubkey={this.web3solAccount.pubKey} onTokenAsset={(tokenAccPubkey) => this.setSourceTokenAccountPublicKey(tokenAccPubkey)}/>
            <TransferTokenNumberInput onTransferTokenNumber={(num) => this.setTransferTokenAmount(num)}/>
            <p/>
            <p/>
            新建代币账户地址:
            <FormGroup>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/account.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value={this.state.newTokenAccountPublicKey}/>
                <InputGroup.Button>
                  <OverlayTrigger placement="bottom" overlay={copyTooltip}>
                    <Button onClick={() => this.copyNewTokenAccountPublicKey()}>
                      <Glyphicon glyph="copy" />
                    </Button>
                  </OverlayTrigger>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
            <p/>

            <OverlayTrigger placement="bottom" overlay={createNewTokenAccounttip}>
              <Button disabled={createNewTokenAccountDisabled}  bsStyle="danger" onClick={() => this.createNewTokenAccount()}>
                <Glyphicon glyph="repeat" />
              </Button>
            </OverlayTrigger>
            <div className="text-center">
              <Button disabled={transferDisabled} onClick={() => this.transferToken()}>发送</Button>
            </div>
          </Panel.Body>
        </Panel>
        <p/>
        <Panel style={{display: 'none'}}>
          <Panel.Heading>
            <img src="img/account_info.png"/>
            代币信息
          </Panel.Heading>
          <Panel.Body>
            <FormGroup>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_DDU.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='DDP                            100000000000.0000'/>
              </InputGroup>
              <p/>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_DDU.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='DDU                            10000000000.0000'/>
              </InputGroup>
              <p/>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_MZB.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='MZB                            10000000000.0000'/>
              </InputGroup>
              <p/>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_PET.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='PET                            100000000000.0000'/>
              </InputGroup>
              <p/>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_Icon.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='CTT                            10000000000.0000'/>
              </InputGroup>
              <p/>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_Icon.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='PYH                            100000000000.0000'/>
              </InputGroup>
              <p/>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_Icon.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='TPC                            100000000000.0000'/>
              </InputGroup>
              <p/>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_Icon.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='KC                            50000000000.0000'/>
              </InputGroup>
              <p/>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_Icon.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='TBC                            50000000000.0000'/>
              </InputGroup>
              <p/>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_Icon.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='MYC                            10000000000.0000'/>
              </InputGroup>
              <p/>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_Icon.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='SBC                            100000000000.0000'/>
              </InputGroup>
              <p/>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_Icon.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='TC                            100000000000.0000'/>
              </InputGroup>
              <p/>
              <InputGroup>
                <InputGroup.Addon style={{padding: '3px',backgroundColor: '#337ab7',border:'none'}}><img src="img/token_Icon.png"/></InputGroup.Addon>
                <FormControl readOnly type="text" size="21" value='ADC                            100000000000.0000'/>
              </InputGroup>
            </FormGroup>
          </Panel.Body>
        </Panel>
        <p/>
      </div>
    );
  }
}
Wallet.propTypes = {
  store: PropTypes.object,
};

