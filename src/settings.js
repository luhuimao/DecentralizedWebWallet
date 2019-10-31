import React from 'react';
import {
  Button,
  DropdownButton,
  HelpBlock,
  MenuItem,
  FormControl,
  FormGroup,
  InputGroup,
  Panel,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import * as web3 from '@luhuimao/bitconch-web3j';

const setting_btn_style = {
  opacity: '1 !important',
  marginTop: '12px',
  // backgroundColor: '#21ba45',
  color: 'rgb(255, 255, 255)',
  letterSpacing: '2px',
  border: '2px solid',
  width: 'auto',
  height: '34px',
  borderRadius: '30px',
  float: ''
};

export class Settings extends React.Component {
  forceUpdate = () => {
    super.forceUpdate();
    this.checkNetwork();
  }

  state = {
    validationState: null,
    validationHelpBlock: null,
    checkNetworkCount: 0,
  };

  componentDidMount() {
    this.props.store.onChange(this.forceUpdate);
    this.checkNetwork();
  }

  componentWillUnmount() {
    this.props.store.removeChangeListener(this.forceUpdate);
  }

  setNetworkEntryPoint(url) {
    console.log('update', url);
    this.props.store.setNetworkEntryPoint(url);
  }

  async checkNetwork() {
    console.log(
      '检查网络:',
      this.props.store.networkEntryPoint
    );

    const connection = new web3.Connection(this.props.store.networkEntryPoint);
    const checkNetworkCount = this.state.checkNetworkCount + 1;
    this.setState({
      validationState: 'warning',
      validationHelpBlock: '连接到网络...',
      checkNetworkCount,
    });

    try {
      const lastId = await connection.fetchRecentBlockhash();
      console.log(lastId);
      if (this.state.checkNetworkCount <= checkNetworkCount) {
        this.setState({
          validationState: 'success',
          validationHelpBlock: '连接成功',
        });
      }
    } catch (err) {
      alert(err);
      console.log('checkNetwork error:', err);
      if (this.state.checkNetworkCount <= checkNetworkCount) {
        this.setState({
          validationState: 'error',
          validationHelpBlock: '连接失败',
        });
      }
    }
  }

  async resetAccount() {
    await this.props.store.createAccount();
    this.setState({
      balance: await this.web3sol.fetchAccountBalance(this.web3solAccount.pubKey),
    });
  }

  render() {
    return (
      <div>
        <p/>
        <Panel>
          <Panel.Heading>网络设置</Panel.Heading>
          <Panel.Body>
            <FormGroup validationState={this.state.validationState}>
              <InputGroup>
                <DropdownButton
                  componentClass={InputGroup.Button}
                  title="网络"
                  onSelect={::this.setNetworkEntryPoint}
                >
                  {
                    [
                      'http://47.75.189.25:10099',
                      'http://localhost:10099'
                    ].map((url, index) => <MenuItem key={index} eventKey={url}>{url}</MenuItem>)
                  }
                </DropdownButton>
                <FormControl
                  type="text"
                  value={this.props.store.networkEntryPoint}
                  placeholder="输入网络URI"
                  onChange={(e) => this.setNetworkEntryPoint(e.target.value)}
                />
                <FormControl.Feedback />
              </InputGroup>
              <HelpBlock>{this.state.validationHelpBlock}</HelpBlock>
            </FormGroup>
          </Panel.Body>
        </Panel>
        <p/>
        <Panel>
          <Panel.Heading style={{fontFamily:'Open Sans', color:'#567fc3', fontWeigth:'700', backgroundColor:'#fff'}}>账户设置</Panel.Heading>
          <Panel.Body>
            <Button style={setting_btn_style} bsStyle="danger" onClick={() => this.resetAccount()}>重置账户</Button>
            <p />
            <HelpBlock>
              重置后，当前账户相关的信息将会丢失
            </HelpBlock>
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}
Settings.propTypes = {
  store: PropTypes.object,
};

