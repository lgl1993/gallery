require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

var yeomanImage = require('../images/yeoman.png');

var imageDatas = require('../data/imageDatas.json');

//将图片信息转成URL路径
imageDatas = (function getImageUrl(imageDataArr) {
    for (var i = 0, len = imageDataArr.length; i < len; i++) {
        var singleImageData = imageDataArr[i];
        singleImageData.imageUrl = require('../images/' + singleImageData.fileName);
        imageDataArr[i] = singleImageData;
    }
    return imageDataArr;
})(imageDatas);

/*
 *获取区间随机值
 */
function getRangeRandom(low, hight) {
    return Math.ceil(Math.random() * (hight - low) + low);
}

/*
 *获取0-30之间的任意值
 */
function get30DegRandom() {
    return (Math.random() > 0.5 ? '' : '-' + Math.ceil(Math.random() * 30))
}

/*
 * image 组件
 */
class ImgFigure extends React.Component {
    constructor(props) {
        super(props);
    }

    /*
     * ImgFigure 点击处理函数
     */
    handleClick = (e) => {
        if (this.props.arrange.isCenter) {
            this.props.inverse()
        } else {
            this.props.center()
        }
        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        var styleObj = {};

        //如果props属性指定了位置
        if (this.props.arrange.pos) {
            styleObj = this.props.arrange.pos;
        }

        //如果图片有旋转，添加旋转属性
        if (this.props.arrange.rotate) {
            ['MozTransform', 'msTransform', 'WebkitTransform', 'transform'].forEach(function(val) {
                styleObj[val] = 'rotate(' + this.props.arrange.rotate + 'deg)';
            }.bind(this))
        }

        //如果居中，设置index
        if(this.props.arrange.isCenter){
          styleObj.zIndex = 11;
        }

        //设置类名
        var imgFigureClassName = 'img-figure';
            imgFigureClassName +=this.props.arrange.isInverse ? ' is-inverse' : ''; 
        
        return(
          <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
            <img src = {this.props.data.imageUrl} alt={this.props.data.title}/>
            <figcaption>
              <h2 className='img-title'>{this.props.data.title}</h2>
              <div className='img-back' onClick={this.handleClick}>
                <p>
                    {this.props.data.desc}                
                </p>
              </div>
            </figcaption>
          </figure>
        );    
    }
}

//控制组件
class ControllerUnit extends React.Component{
  constructor(props) {
        super(props);
    }
  handleClick = (e) => {
    if(this.props.arrange.isCenter){
      this.props.inverse()
    }else{
      this.props.center();
    }
    e.preventDefault();
    e.stopPropagation();
  };
  render(){
    var controllerUnitClassName = 'controller-unit';
    if(this.props.arrange.isCenter){
      controllerUnitClassName += ' is-center';
      //如果对应翻转图片，显示按钮翻转
      if(this.props.arrange.isInverse){
        controllerUnitClassName +=' is-inverse';
      }
    }
    return(
      <span className={controllerUnitClassName} onClick={this.handleClick}></span>
    );
  }
}

class AppComponent extends React.Component {
    constructor(props){
    super(props);
    
  }  
   Constant = {
     centerPos: {
         left: 0,
         right: 0
     },
     hPosRange: {   // 水平方向的取值范围
         leftSecX: [0, 0],
         rightSecX: [0, 0],
         y: [0, 0]
     },
     vPosRange: {    // 垂直方向的取值范围
         x: [0, 0],
         topY: [0, 0]
     }
   };
   state = {
       imgsArrangeArr: [
    {
     pos: {
       left: 0,
       top: 0
     },
     rotate: 0,    // 旋转角度
     isInverse: false,    // 图片正反面
     isCenter: false    // 图片是否居中
     }
  ]
    }
   /*
    * 翻转图片
    * @param index 传入当前图片对应的index
    * @returns {Function}
    */
    inverse (index){
      return function(){
        var imgsArrangeArr = this.state.imgsArrangeArr;
        imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
        this.setState({
          imgsArrangeArr:imgsArrangeArr
        })
      }.bind(this);
    }

    /*
     * 重新布局
     * @param centerIndex 居中排布图片
     */
    rearrange (centerIndex){
      var imgsArrangeArr = this.state.imgsArrangeArr,
          centerPos = this.Constant.centerPos,
          hPosRange = this.Constant.hPosRange,
          vPosRange = this.Constant.vPosRange,
          hPosRangeLeftSecX = hPosRange.leftSecX,
          hPosRangeRightSecX = hPosRange.rightSecX,
          hPosRangeY = hPosRange.y,
          vPosRangeTopY = vPosRange.topY,
          vPosRangeX = vPosRange.x,

          imgsArrangeTopArr = [],
          topImgNum = Math.floor(Math.random() * 2),
          topImgSpliceIndex = 0,
          imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);
          
          imgsArrangeCenterArr[0] = {
            pos:centerPos,
            rotate:0,
            isCenter:true
          };

          //取出上侧图片信息
          topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);

        // 布局位于上侧的图片
        imgsArrangeTopArr.forEach(function (value, index) {
            imgsArrangeTopArr[index] = {
              pos: {
                  top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                  left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
              },
              rotate: get30DegRandom(),
              isCenter: false
            };
        });

        // 布局左右两侧的图片
        for (var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
          var hPosRangeLORX = null;

          // 前半部分布局左边， 右半部分布局右边
          if (i < k) {
              hPosRangeLORX = hPosRangeLeftSecX;
          } else {
              hPosRangeLORX = hPosRangeRightSecX;
          }

          var newTop = getRangeRandom(hPosRangeY[0], hPosRangeY[1]);
          var newLeft = getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1]);

          imgsArrangeArr[i] = {
            pos: {
                top: newTop,
                left: newLeft
            },
            rotate: get30DegRandom(),
            isCenter: false
          };

        }

        if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }

        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

        this.setState({
            imgsArrangeArr: imgsArrangeArr
        });
  }
    /*
     * 利用arrange，居中index对应的图片
     * @param index 要居中的图片信息
     * @returns {Function}
     */
    center(index){
      return function(){
        this.rearrange(index)
      }.bind(this)
    }
    // 组件加载以后， 为每张图片计算其位置的范围
    componentDidMount(){
      //拿到舞台大小
      var stageDOM = ReactDOM.findDOMNode(this.refs.stage),
          stageW = stageDOM.scrollWidth,
          stageH = stageDOM.scrollHeight,
      halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);
      // 拿到一个imageFigure的大小

      var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2);

      // 计算中心图片的位置点
      this.Constant.centerPos = {
        left: halfStageW - halfImgW,
        top: halfStageH - halfImgH
      };

      // 计算左侧，右侧区域图片排布位置的取值范围
      this.Constant.hPosRange.leftSecX[0] = -halfImgW;
      this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
      this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
      this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
      this.Constant.hPosRange.y[0] = -halfImgH;
      this.Constant.hPosRange.y[1] = stageH - halfImgH;

      // 计算上侧区域图片排布位置的取值范围
      this.Constant.vPosRange.topY[0] = -halfImgH;
      this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
      this.Constant.vPosRange.x[0] = halfStageW - imgW;
      this.Constant.vPosRange.x[1] = halfStageW;

      this.rearrange(0);
  }
  render() {
    var ControllerUnits = [],
        ImgFigures = [];
        imageDatas.forEach(function(value,index){
          if(!this.state.imgsArrangeArr[index]){
            this.state.imgsArrangeArr[index] = {
              pos:{
                left:0,
                top:0
              },
              rotate:0,
              isInverse:false,
              isCenter:false
            };
          }
        ImgFigures.push(<ImgFigure key={index} data={value} ref={'imgFigure' + index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);
        ControllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);        
      }.bind(this));
      return(
        <section className='stage' ref='stage'>
          <section className='img-sec'>
            {ImgFigures}
          </section>
          <nav className="controller-nav">
            {ControllerUnits}
          </nav>
        </section>
      );
}

}
// class AppComponent extends React.Component {
//   render() {
//     return (
//       <div className="index">
//         <img src={yeomanImage} alt="Yeoman Generator" />
//         <span> 你好 </span>
//         <div className="notice">Please edit <code>src/components/Main.js</code> to get started!</div>
//       </div>
//     );
//   }
// }

AppComponent.defaultProps = {};

export default AppComponent;