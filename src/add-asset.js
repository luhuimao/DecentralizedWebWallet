import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ProgressBar,
} from 'react-bootstrap';
import * as web3 from '@luhuimao/bitconch-web3j';
import sleep from 'sleep-promise';

import {getNewTokenList, getAssetByOwnerPubKey} from './util/read-write-db';
import AddIcon from './images/main_jia.png';
import SelectOn from './images/selecte_on.png';
import SelectOff from './images/selecte_off.png';

var lineStyle = {
  height: '0.5px',
  backgroundColor: '#b8b6b6',
  marginLeft:'0',
};

const confirm_btn_style = {
  opacity: '1 !important',
  // marginTop: '12px',
  backgroundColor: '#21ba45',
  color: 'rgb(255, 255, 255)',
  letterSpacing: '2px',
  border: '2px solid',
  // width: 'auto',
  height: '34px',
  borderRadius: '30px',
  float: '',
  // backgroundColor:'#2cb782',
  // color:'#fff',
  width:'80px',
  marginTop:'10px'
};

export class AddPropertyModal extends React.Component {
    state={
      tokenNameArray:[],
      busyModal: null,
    }
    PostPoroertyList(tokenarr){
      this.props.tokenarr(tokenarr);
      console.log('第2步:::::::',tokenarr);
    }

    constructor(props) {
      super(props);
    }
    componentDidMount() {
      this.sleeping(3);
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

    sleeping(n) {
      this.runModal('数据读取中','请稍后...',async () => await sleep(n*1000));
    }

    render() {
      const busyModal = this.state.busyModal ?
        <BusyModal show title={this.state.busyModal.title} text={this.state.busyModal.text} /> : null;
      return (
        <div>
          {busyModal}
          <Modal {...this.props} bsSize="large" aria-labelledby="contained-modal-title-lg">
            <Modal.Header closeButton>
              <div style={{textAlign:'center'}}>
                <input readOnly value='添加新资产' style={{fontSize:'16px',color:'#2b2b2b',width:'auto',border:'none',backgroundColor:'transparent',textAlign:'center'}}/>
              </div>
            </Modal.Header>
            <Modal.Body>
              <div>
                <div>
                  <NewTokenAsset sleep={() => this.sleeping(2)} ownerPubkey={this.props.ownerPubkey} conn={this.props.conn} onTokenAsset={(tokenarr)=>this.PostPoroertyList(tokenarr)}/>
                </div>
                <div className="text-center">
                  <Button onClick={() => {this.props.addsure();}} style={confirm_btn_style}>确定</Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      );
    }
}

AddPropertyModal.propTypes = {
  conn: PropTypes.object,
  offSelect: PropTypes.function,
  onSelect: PropTypes.function,
  onHide: PropTypes.function,
  addsure: PropTypes.function,
  tokenarr: PropTypes.function,
  ownerPubkey: PropTypes.object,
  refreshAssetManagePage: PropTypes.function,
  sleep: PropTypes.function,
};

//定义一个Section子组件
export class PropertyAdd extends React.Component{
  //接收父组件传递过来的item
  render(){
    return(
      <div style={{marginBottom:'5px', width:'100%',height:'60.5px',backgroundColor:'transparent'}}>
        <input type="text" readOnly value='添加新资产' style={{fontSize:'22px', fontWeight: '500', width:'auto',height:'60px',color:'#2b2b2b',border:'none',backgroundColor:'transparent',marginLeft:'0'}}/>
        <Button onClick={this.props.addproperty} style={{background:`url(${AddIcon})`,backgroundSize:'30px 30px', width:'30px',height:'30px',borderStyle: 'none',marginRight:'10px',marginTop:'15px',float:'right'}}/>
        <div style={lineStyle}>
        </div>
      </div>
    );
  }
}

PropertyAdd.propTypes = {
  addproperty:PropTypes.function,
};

class NewTokenAsset extends React.Component {
    state = {
      tokenNameArray: [],
      assetArray: [],
    };

    constructor(props) {
      super(props);
      getAssetByOwnerPubKey(this, this.props.ownerPubkey, this.setTokenAsset);
      getNewTokenList(this, this.props.ownerPubkey, this.readPublicKeyFromFile);
    }

    setTokenAsset(obj, data) {
      try {
        var arr_token_pubkey = [];
        for(var i = 0; i < data.length; i++) {
          const tokenpubkey = data[i][3];
          arr_token_pubkey.push(
            tokenpubkey,
          );
        }
        obj.setState({
          assetArray: arr_token_pubkey,
        });
      }catch(err){
        alert('faucet/src/add-asset.js NewTokenAsset::setTokenAsset' + err.message);
      }
    }

    AddTokenNameArray(){
      this.props.onTokenAsset(this.state.tokenNameArray);
      console.log('第一步:::::::',this.state.tokenNameArray);
    }
    async readPublicKeyFromFile(obj, data) {
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
          // var tokenlogo = info.TokenInfos[i].tokenlogo;
          var tokenselected = false;
          var tokenaccpubkey = '';
          var tokenamount = '10';
          var tokenpublickey = data[i][3];
          if (obj.state.assetArray) {
            if (tokenpublickey && obj.state.assetArray.includes(tokenpublickey) == false) {
              arrToken.push({
                tokenpublickey,
                tokenaccpubkey,
                tokenname,
                tokensymbol,
                tokensupply,
                tokendecimal,
                // tokenlogo,
                tokenselected,
                tokenamount,
              });
            }
          }
        }
        if (arrToken) {
          obj.setState({
            tokenNameArray: arrToken
          });
        }
      } catch (err)
      {
        alert('faucet/src/add-asset.js NewTokenAsset::readPublicKeyFromFile(): ' + err.message);
        // this.addError(err.message);
      }
    }
    addSelectedToken(index){
      console.log('index:::::::',index);
      var tokeninfo = this.state.tokenNameArray[index];
      console.log('tokeninfo:::::::',tokeninfo);
      if (tokeninfo.tokenselected == false) {
        tokeninfo.tokenselected = true;
        document.getElementById('button'+index).style.background=`url(${SelectOn})`;
        document.getElementById('button'+index).style.backgroundSize='25px 25px';
      }else{
        tokeninfo.tokenselected = false;
        document.getElementById('button'+index).style.background=`url(${SelectOff})`;
        document.getElementById('button'+index).style.backgroundSize='25px 25px';
      }
      this.AddTokenNameArray();
    }
    render() {
      return (
        <div>
          {
            this.state.tokenNameArray.map((obj,index) => {
              return(
                <PropertySelect key={index} tokenLogo={obj.tokenlogo} tokenName={obj.tokenname} tokenselected= {obj.tokenselected} buttonId = {'button'+index} selected={()=>this.addSelectedToken(index)}/>
              );
            })
          }
        </div>
      );
    }
}

NewTokenAsset.propTypes = {
  onTokenAsset: PropTypes.function,
  conn: PropTypes.object,
  ownerPubkey: PropTypes.object,
  sleep: PropTypes.function,
};

class PropertySelect extends React.Component{
  state = {
    imageurl: this.props.tokenselected == false? SelectOff:SelectOn
  }
  constructor(props) {
    super(props);
  }
  render(){
    return(
      <div style={{height:'80px',width:'100%'}}>
        <input type="text" readOnly value={this.props.tokenName} style={{fontSize:'16px',width:'auto',height:'80px',color:'#2b2b2b',border:'none',backgroundColor:'transparent',marginLeft:'5px'}}/>
        <Button id={this.props.buttonId} onClick={this.props.selected} style={{background:`url(${this.state.imageurl})`,float:'right',backgroundSize:'25px 25px',width:'25px',height:'25px',borderStyle: 'none',marginRight:'10px',marginTop:'27.5px'}}/>
        <div style={lineStyle}>
        </div>
      </div>
    );
  }
}

PropertySelect.propTypes = {
  tokenLogo: PropTypes.object,
  tokenName: PropTypes.object,
  selected: PropTypes.function,
  switchOn: PropTypes.object,
  buttonId: PropTypes.object,
  tokenselected: PropTypes.object
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