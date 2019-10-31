import React from 'react';


export class AdvanceSetting extends React.Component {
  render() {
    return(
      <div>
        <div style={{paddingBottom: '0px', boxSizing: 'inherit', }}>
          <div style={{textAligh:'center', width:'360px', margin:'0px auto', paddingTop:'0'}}>
            <div id='top' style={{boxSizing: 'inherit',textAligh:'center'}}>
              <div id='topR'>
                <div className="ui container sc-gqjmRU lkQupP" style={{display: 'block', width: '100%', marginLeft: 'auto !important', marginRight: 'auto !important', maxWidth: '100% !important'}}>
                  <div className="ui grid title-section" style={{marginTop:'-1rem',marginBottom:'-1rem',marginLeft:'-1rem',marginRight:'-1rem'}}>
                    <div className="one column row page-title center" style={{width:'100%',textAlign:'center', marginLeft:'0'}}>
                      <h1 className="title">高级设定
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
                          <h1 className="title">即将在下个版本开放测试,敬请期待</h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}