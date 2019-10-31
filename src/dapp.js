import React from 'react';
import { MDBContainer, MDBRow, MDBCol } from 'mdbreact';


export class DAPP extends React.Component {
  render(){
    return(
      <div style={{paddingBottom:'20px'}}>
        <div className="ui container sc-gqjmRU lkQupP" style={{display: 'block', width: '100%', marginLeft: 'auto !important', marginRight: 'auto !important', marginBottom:'20px',maxWidth: '100% !important'}}>
          <div className="ui grid title-section" style={{marginTop:'-1rem',marginBottom:'-1rem',marginLeft:'-1rem',marginRight:'-1rem'}}>
            <div className="one column row page-title center" style={{width:'100%',textAlign:'center', marginLeft:'0'}}>
              <h1 className="title">分布式应用
              </h1>
            </div>
          </div>
        </div>
        <MDBContainer className="mt-5 dapp-container">
          <MDBRow style={{marginBottom:'10px'}}>
            <MDBCol lg="4" md="12" className="mb-4">
              <img  src="https://bitconch.io/upload/image/201910/6c48bc98-60a0-4d83-a5a4-50df32ce2a62.png" className="img-fluid z-depth-1" alt="" />
            </MDBCol>
            <MDBCol lg="4" md="6" className="mb-4">
              <img src="https://bitconch.io/upload/image/201909/6a2a222b-af66-4ccd-a1e3-9e483ccdc4c7.png" className="img-fluid z-depth-1-half"
                alt="" />
            </MDBCol>
            <MDBCol lg="4" md="6" className="mb-4">
              <img  src="https://bitconch.io/upload/image/201909/50a1f037-9bae-459f-aa12-7796887f71fe.png" className="img-fluid z-depth-2" alt="" />
            </MDBCol>
          </MDBRow>
          <MDBRow style={{marginBottom:'10px'}}>
            <MDBCol lg="4" md="12" className="mb-4">
              <img src="https://bitconch.io/upload/image/201909/98c53e3a-cb7c-4eaa-b4e1-6a384dae6786.png" className="img-fluid z-depth-3" alt="" />
            </MDBCol>
            <MDBCol lg="4" md="6" className="mb-4">
              <img src="https://bitconch.io/upload/image/201909/24ace413-cf31-48cc-8232-ef3c925b88a3.png" className="img-fluid z-depth-4" alt="" />
            </MDBCol>
            <MDBCol lg="4" md="6" className="mb-4">
              <img src="https://bitconch.io/upload/image/201909/ff1da707-0f66-4280-a118-32433bb4acf6.png" className="img-fluid z-depth-5" alt="" />
            </MDBCol>
          </MDBRow>
          <MDBRow style={{marginBottom:'10px'}}>
            <MDBCol lg="4" md="12" className="mb-4">
              <img  src="https://bitconch.io/upload/image/201909/203683e8-4f87-4b49-98a1-630e8edd3642.png" className="img-fluid z-depth-1" alt="" />
            </MDBCol>
            <MDBCol lg="4" md="6" className="mb-4">
              <img src="https://bitconch.io/upload/image/201909/44e40a83-b649-420c-aed3-8352de6ef16a.png" className="img-fluid z-depth-1-half" alt="" />
            </MDBCol>
            <MDBCol lg="4" md="6" className="mb-4">
              <img  src="https://bitconch.io/upload/image/201909/f98c1946-bf9f-4134-b36f-1a5e083868d9.png" className="img-fluid z-depth-2" alt="" />
            </MDBCol>
          </MDBRow>
          <MDBRow style={{marginBottom:'10px'}}>
            <MDBCol lg="4" md="12" className="mb-4">
              <img  src="https://bitconch.io/upload/image/201909/cdbc0d90-d3ff-4b69-851b-d81844bb9f84.png" className="img-fluid z-depth-1" alt="" />
            </MDBCol>
            <MDBCol lg="4" md="6" className="mb-4">
              <img src="https://bitconch.io/upload/image/201909/4791dc3d-112d-4f43-bd09-845342b5bcc9.png" className="img-fluid z-depth-1-half"
                alt="" />
            </MDBCol>
            <MDBCol lg="4" md="6" className="mb-4">
              <img  src="https://bitconch.io/upload/image/201909/c8ec9899-2e02-41ad-b72e-f0f810ce38d7.png" className="img-fluid z-depth-2" alt="" />
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </div>
    );
  }
}