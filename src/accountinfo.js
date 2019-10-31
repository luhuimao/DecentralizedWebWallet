import React from 'react';
import {
  Button,
  FormControl,
  FormGroup,
  Glyphicon,
  InputGroup,
  OverlayTrigger,
  Panel,
  Tooltip,
  ProgressBar,
  Modal,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';

import {Settings} from './settings';

const import_btn_style = {
  opacity: '1 !important',
  marginTop: '12px',
  backgroundColor: '#21ba45',
  color: 'rgb(255, 255, 255)',
  letterSpacing: '2px',
  border: '2px solid',
  width: 'auto',
  height: '34px',
  borderRadius: '30px',
  float: ''
};

const close_btn_style = {
  opacity: '1 !important',
  marginTop: '12px',
  backgroundColor: '#21ba45',
  color: 'rgb(255, 255, 255)',
  letterSpacing: '2px',
  border: '2px solid',
  width: 'auto',
  height: '34px',
  borderRadius: '30px',
  float: 'right'
};

const setting_btn_style = {
  opacity: '1 !important',
  marginTop: '12px',
  backgroundColor: '#21ba45',
  color: 'rgb(255, 255, 255)',
  letterSpacing: '2px',
  border: '2px solid',
  width: 'auto',
  height: '34px',
  borderRadius: '30px',
  float: 'right'
};

const import_privtekey_btn_style = {
  opacity: '1 !important',
  marginTop: '12px',
  backgroundColor: '#21ba45',
  color: 'rgb(255, 255, 255)',
  // fontWeight: '500',
  letterSpacing: '2px',
  border: '2px solid',
  width: 'auto',
  height: '34px',
  borderRadius: '30px',
  // fontSize: '18px',
  float: ''
};

const export_privtekey_btn_style = {
  opacity: '1 !important',
  marginTop: '12px',
  backgroundColor: '#21ba45',
  color: 'rgb(255, 255, 255)',
  // fontWeight: '500',
  letterSpacing: '2px',
  border: '2px solid',
  width: 'auto',
  height: '34px',
  borderRadius: '30px',
  // fontSize: '18px',
  marginLeft:'5px',
  float: ''
};

const refresh_btn_style = {
  opacity: '1 !important',
  marginTop: '12px',
  backgroundColor: '#21ba45',
  color: 'rgb(255, 255, 255)',
  // fontWeight: '500',
  letterSpacing: '2px',
  // margin: '24px 0px 0px 32px',
  margin:'0 5px 0 23px',
  border: '2px solid',
  width: 'auto',
  height: '34px',
  borderRadius: '30px',
  // fontSize: '18px'
};

const airdrop_btn_style = {
  opacity: '1 !important',
  marginTop: '12px',
  backgroundColor: '#21ba45',
  color: 'rgb(255, 255, 255)',
  // fontWeight: '500',
  letterSpacing: '2px',
  // margin:'0 5px 0 23px',
  margin: 'auto 24px',
  border: '2px solid',
  // width: '68px',
  width: 'auto',
  height: '34px',
  borderRadius: '30px',
  // fontSize: '18px'
};

const AIRDORP_QUOTA = 3000;

export class AccountInfo extends React.Component {
  state = {
    busyModal: null,
    settingsModal: false,
    exportSercetModal:false,
    mysecretKey:null,
    balance: 0,
    tokenName: null,
    tokenAmount: 0,
    newTokenAccountPublicKey: null,
  };

  constructor(props) {
    super(props);
    this.refreshBalance();
  }

  copyPublicKey() {
    copy(this.props.web3jAccount.pubKey);
  }

  resetAccount() {
    this.runModal(
      '申请新账户',
      '请稍后...',
      async () => {
        await this.props.store.createAccount();
        this.setState({
          balance: await this.props.conn.fetchAccountBalance(this.props.web3jAccount.pubKey),
        });
      }
    );
  }

  exportPrivateKey() {
    copy(this.props.web3jAccount.privateKey);
  }

  refreshBalance() {
    this.runModal(
      '更新账户余额',
      '请稍后...',
      async () => {
        this.setState({
          balance: await this.props.conn.fetchAccountBalance(this.props.web3jAccount.pubKey),
        });
      }
    );
  }

  requestAirdrop() {
    this.runModal(
      '申请空投',
      '请稍后...',
      async () => {
        await this.props.conn.reqDrone(this.props.web3jAccount.pubKey, AIRDORP_QUOTA);
        this.setState({
          balance: await this.props.conn.fetchAccountBalance(this.props.web3jAccount.pubKey),
        });
      }
    );
  }

  copyNewTokenAccountPublicKey() {
    copy(this.state.newTokenAccountPublicKey);
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

  render(){
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
    const busyModal = this.state.busyModal ?
      <BusyModal show title={this.state.busyModal.title} text={this.state.busyModal.text} /> : null;
    const settingsModal = this.state.settingsModal ?
      <SettingsModal show store={this.props.store} onHide={() => this.setState({settingsModal: false})}/> : null;
    const airdropDisabled = this.state.balance !== 0;
    const exportSercetModal = this.state.exportSercetModal ? (
      <ExportSercetModal
        show
        onHide={() => this.setState({exportSercetModal: false})}
        updateaccount={() => this.getAcount()}
        exsecretkey={key => this.setMySerectkey(key)}
      />
    ) : null;

    return(
      <div style={{paddingBottom:'20px', overflowY:'auto'}}>
        {busyModal}
        {settingsModal}
        {exportSercetModal}
        <div style={{paddingBottom: '0px', boxSizing: 'inherit', }}>
          <div style={{textAligh:'center', width:'360px', margin:'0px auto', paddingTop:'0'}}>
            <div id='top' style={{boxSizing: 'inherit',textAligh:'center'}}>
              <div id='topR'>
                <div className="ui container sc-gqjmRU lkQupP" style={{display: 'block', width: '100%', marginLeft: 'auto !important', marginRight: 'auto !important', maxWidth: '100% !important'}}>
                  <div className="ui grid title-section" style={{marginTop:'-1rem',marginBottom:'-1rem',marginLeft:'-1rem',marginRight:'-1rem'}}>
                    <div className="one column row page-title center" style={{width:'100%',textAlign:'center', marginLeft:'0'}}>
                      <h1 className="title">账户信息
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
                          <Button onClick={() => this.setState({settingsModal: true})} bsSize="small" bsStyle="primary" style={setting_btn_style}>
                            <Glyphicon glyph="cog"/>设置
                          </Button>
                          <h1>公钥</h1>
                          <FormGroup>
                            <InputGroup>
                              <FormControl readOnly type="text" size="21" value={this.props.web3jAccount.pubKey}/>
                              <InputGroup.Button>
                                <OverlayTrigger placement="bottom" overlay={copyTooltip}>
                                  <Button onClick={() => this.copyPublicKey()}>
                                    <Glyphicon glyph="copy" />
                                  </Button>
                                </OverlayTrigger>
                              </InputGroup.Button>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div style={{display: 'flex', flexFlow:'row-reverse'}}>
                          <OverlayTrigger placement="bottom" overlay={exportTooltip}>
                            <Button  onClick={() => this.exportPrivateKey()} style={export_privtekey_btn_style}>
                              <Glyphicon glyph="export" />导出秘钥
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger placement="bottom" overlay={changeTooltip}>
                            <Button  onClick={() => this.setState({exportSercetModal: true})} style={import_privtekey_btn_style}>
                              <Glyphicon glyph="import" />导入秘钥
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="item amount border-top">
                    <div className="sc-jWBwVP bgeZku">
                      <div className="required field">
                        <div className="ui input">
                          <h1>余额</h1>
                          <input readOnly value={this.state.balance} style={{readOnly:'true',width: '100%', padding: '0px',textAlign: 'center',color: 'rgb(74, 79, 84)',lineHeight: '80px',fontWeight: '500',fontSize: '72px',fontFamily: 'Bw Seido Round',height: '80px', border: '0px none'}}></input>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id='bottom' style={{oxSizing: 'inherit', textAligh:'center',}}>
              <div className="ui list list-bottom border" style={{display: 'flex', flexFlow: 'row-reverse',borderImage:'none 100% / 1 / 0 stretch',padding: '0px 0px 12px', borderRadius: '0px 0px 8px 8px', borderColor: 'rgb(230, 230, 230)', borderStyle: 'none solid solid', borderWidth: '0px 4px 4px'}}>
                <div className="item send-money" style={{paddingBottom:'12px',marginTop: '0px', marginBottom: '12px'}}>
                  <OverlayTrigger placement="top" overlay={refreshBalanceTooltip}>
                    <Button style={refresh_btn_style} onClick={() => this.refreshBalance()}>
                      <Glyphicon glyph="refresh" />刷新
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="bottom" overlay={airdropTooltip}>
                    <Button style={airdrop_btn_style} disabled={airdropDisabled} onClick={() => this.requestAirdrop()}>
                      <Glyphicon glyph="arrow-down" />空投
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger  placement="bottom" overlay={resetTooltip}>
                    <Button style={{display: 'none'}} bsStyle="danger" onClick={() => this.resetAccount()}>
                      <Glyphicon glyph="repeat" />
                    </Button>
                  </OverlayTrigger>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
AccountInfo.propTypes = {
  conn: PropTypes.object,
  web3jAccount: PropTypes.object,
  store: PropTypes.object,
  balance: PropTypes.object,
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
  store: PropTypes.object,
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
          <Button onClick={this.props.onHide} style={close_btn_style}>关闭</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
SettingsModal.propTypes = {
  onHide: PropTypes.function,
  store: PropTypes.object,
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
                  <Button onClick={() => this.props.updateaccount()} style={import_btn_style}>
                    <Glyphicon glyph="import" />
                    导入
                  </Button>
                </FormGroup>
              </Panel.Body>
            </Panel>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide} style={close_btn_style}>关闭</Button>
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