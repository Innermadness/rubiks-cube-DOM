//创建备选层对象：
var isChose = {
    flag:false,
    blocks:[],
    twisting:false,
    ubs:[],
    resortCages:[]
};

function paint (whichCage,n,color) {
    var outers = document.querySelectorAll("."+whichCage+" .unit-block>div:nth-child("+n+")");
    for (var i=0;i<outers.length;i++) {
        outers[i].style.backgroundColor=color;
    }
}
paint("front",1,"red");
paint("left",4,"yellow");
paint("right",2,"blue");
paint("back",3,"green");
paint("top",5,"lightgray");
paint("bottom",6,"black");

//1、设置随机数0-8，每个数对应一个层的类名，跳过交互、动画等直接触发tempLayer(当前类)选好层；
//2、将当前随机层触发一次switchCage(dir),dir也要随机1或-1；
//3、将上述操作循环n次，先用100来测试性能。
function disorganize () {
    var options = ["front","left","back","right","top","bottom","v-v-mid","v-a-mid","a-a-mid"];
    for (var i= 0, o,cur,dir;i<100;i++) {
        o = Math.floor(Math.random()*9);
        dir = Math.random()>0.5?1:-1;
        cur = options[o];
        tempLayer(cur);
        switchCage(dir);
    }
}
disorganize();
/*====================随机颜色函数组结束====================*/

/*魔方视角函数组：*/
//暂使用键盘操作视角（W、A、S、D）和转动（Q、E），空格回到初始视角，鼠标点击选择层：
//每按一次视角键在原基础上旋转30度
//在twistController中绑定
//目前这样调整镜头的游戏体验极差。。。后续将尝试使用鼠标中间实现无死角调整。
function cameraRotate (dir,axis,step) {
    var view = document.getElementsByClassName("stage")[0].style.transform;
    var reg = eval("/rotate["+axis+"][(][-]?[0-9]+/");
    var now = parseFloat(view.match(reg)[0].match(/[-]?\d+/)[0]);
    var end = now+step*dir;
    function move() {
        if (dir === 1) {
            if (end>now) {
                now+=3;
            } else if(end===now) {
                clearInterval(timer);
            }
            document.getElementsByClassName("stage")[0].
                style.transform = view.replace(reg,view.match(reg)[0].replace(/[-]?\d+/,now));
        } else if (dir===-1) {
            if (end<now) {
                now-=3;
            } else if(end===now) {
                clearInterval(timer);
            }
            document.getElementsByClassName("stage")[0].
                style.transform = view.replace(reg,view.match(reg)[0].replace(/[-]?\d+/,now));
        }
    }
    var timer = setInterval(move,16.7);
}
function cameraReset () {
    var view = document.getElementsByClassName("stage")[0];
    view.style.transform="rotateX(-20deg) rotateY(45deg)";
}
/*视角函数组结束===========================================================*/

/*鼠标悬浮交互函数组，实现鼠标悬浮时相应层高亮(半透明)，点击选中后相应层出现亮色模糊轮廓*/
//鼠标悬浮事件绑定函数：
function mouseHover(whichLayer,rgba) {
    if (!isChose.twisting) {
        var sameLayerFaces = document.querySelectorAll("."+whichLayer+">.hover");
        for (var j=0;j<sameLayerFaces.length;j++) {
            sameLayerFaces[j].style.backgroundColor = rgba;
        }
    }
}
//鼠标点击事件绑定函数，即把当前高亮的层下的块添加到数组，并加轮廓：
function tempLayer (whichLayer) {
    if (!isChose.twisting) {
        var arr = isChose.blocks;
        //先清已有的轮廓
        for (var n=0;n<arr.length;n++) {
            var already = arr[n].querySelectorAll(".unit-block>div");
            for (var l=0;l<already.length;l++) {
                already[l].style.boxShadow="";
            }
        }
        isChose.flag = false;//把标记转为false，表明现在没有被选中的层
        arr.length = 0;//把现有的选中层数组清空。
        //把当前选中的层的块加入数组：
        var layerItems = document.querySelectorAll("."+whichLayer+">.core");
        for (var i=0;i<layerItems.length;i++) {
            arr.push(layerItems[i]);
        }
        //给选中层的所有面添加轮廓：
        var layerFaces = document.querySelectorAll("."+whichLayer+" .unit-block>div");
        for (var j=0;j<layerFaces.length;j++) {
            layerFaces[j].style.boxShadow = "0 0 10px 6px rgba(64,225,230,0.8)";
        }
        isChose.flag = true;//标记变为true，表明现在有被选中的层。
    }
}
//鼠标事件函数：
function outerBind(whoseOuter,n){
    var targets = document.querySelectorAll("."+whoseOuter+":nth-child(2n+1)>.hover:nth-child("+n+")");
    //console.log(targets);
    for (var i=0;i<targets.length;i++){
        targets[i].onmouseover = function () {
            mouseHover(whoseOuter,"rgba(255,255,255,0.5)");
        };
        targets[i].onmouseout = function () {
            mouseHover(whoseOuter,"");
        };
        targets[i].onclick = function () {
            tempLayer(whoseOuter);
        };
    }
}
function innerBind(whoseOuter) {
    var targets = document.querySelectorAll("."+whoseOuter+">.for2face");
    for (var i=0;i<targets.length;i++) {
        targets[i].onmouseover= function () {
            mouseHover(whoseOuter,"rgba(255,255,255,0.5)");
        };
        targets[i].onmouseout= function () {
            mouseHover(whoseOuter,"");
        };
        targets[i].onclick = function () {
            tempLayer(whoseOuter);
        };
    }
}
//执行绑定：
outerBind("front",1);
outerBind("right",2);
outerBind("back",3);
outerBind("left",4);
outerBind("top",5);
outerBind("bottom",6);
innerBind("v-v-mid");
innerBind("v-a-mid");
innerBind("a-a-mid");
/*鼠标悬浮、单击交互函数组结束=========================================*/

/*选中层实现旋转函数组*/
/*  不能只是旋转，旋转后需要将当前旋转层的块从原cage移动到新cage下
    cage由于是不动的，因此永远可以通过其class选到想要的层。
    这样可避免一次旋转后选层乱套。
*/
//绑定键盘事件函数：
function twistController () {
    document.onkeydown = function (e) {
        switch (e.keyCode) {
            case 81://Q
                twist(1);
                break;
            case 69://E
                twist(-1);
                break;
            case 87://W
                cameraRotate(1,"X",30);
                break;
            case 65://A
                cameraRotate(-1,"Y",30);
                break;
            case 83://S
                cameraRotate(-1,"X",30);
                break;
            case 68://D
                cameraRotate(1,"Y",30);
                break;
            case 32://space
                cameraReset();
                break;
        }
    };
}
twistController();
//判断旋转层属于相对于整个魔方的哪个轴，获得相应的X\Y\Z.：
function axisJudge (){
    var classStr ="",
        arr = isChose.blocks;
    for (var k=0;k<arr.length;k++) {
        var t = arr[k].parentNode.className.substring(6);//提取删除共同字符串cages后的子字符串;
        classStr+=(t+" ");//用空格拼接
    }
    var str = classStr.split(" ").sort().join(" ");//以空格分割成数组后排序，再组成为字符串。
    // console.log(str);
    //该正则表示大于1个字母的单词重复9次。\1代表第1个括号分组里的正则内容
    var reg =  /\b(\D+)\b\s+(\1\b\s?){8}/ig;
    //将返回数组内的唯一元素用空格分割出一个单元素数组，并转为string.
    var matched = String(str.match(reg)[0].split(" ",1));
    //根据获得的字符串判断rotate的轴：
    switch (matched) {
        case "front":
        case "v-a-mid":
        case "back":
            return "Z";
        case "left":
        case "v-v-mid":
        case "right":
            return "X";
        case "top":
        case "a-a-mid":
        case "bottom":
            return "Y";
    }
}

//旋转函数组：
function twist (dir) {
    //以.core为旋转单位，给每个core设置transform-origin到整个魔方中央。
    var arr = isChose.blocks;
    //首先判断是否有选中层，且魔方是否处于正在旋转中：
    if((arr.length!==0)&&(!isChose.twisting)){
        //正在旋转时，去掉cage高亮，避免显示bug。
        var highlights = document.querySelectorAll(".hover");
        for (var j=0;j<highlights.length;j++) {
            highlights[j].style.background = "";
        }
        //判断当前层属于整个魔方的哪个轴：
        var axis = axisJudge();
        //获取当前rotate角度，计算旋转完毕时角度：
        var now = parseFloat(getCur(axis)),
            end = now+90*dir;
        //定时器旋转：
        function move () {
            isChose.twisting = true;
            //开始判断，分顺时针和逆时针两种：：
            if (dir === 1){
                for (var i=0;i<arr.length;i++) {
                    //获取当前transform文本：
                    var str = arr[i].style.transform;
                    //使用eval拼接正则，匹配出如rotateZ(40这种形式的文本：
                    var reg = eval("/rotate["+axis+"][(][-]?[0-9]+/g");
                    //再将匹配出的字符串的数字replace为当前数值，
                    // 再把替换完的字符串替换掉str中的对应部分，
                    // 再赋值回transform：
                    arr[i].style.transform = str.replace(reg,str.match(reg)[0].replace(/[-]?\d+/,now));
                    //console.log(arr[i].style.transform);
                }
                if (end>now) {
                    now+=5;
                } else if (end===now) {
                    clearInterval(timer);
                    timer = null;
                    //动画完瞬间，把各unit-block从原父元素加入新父元素。
                    switchCage(dir);
                    //转到目标角度，就把状态转回false，即已停转。
                    isChose.twisting = false;
                }
            } else if(dir===-1){
                for (var j=0;j<arr.length;j++) {
                    var str1 = arr[j].style.transform;
                    var reg1 = eval("/rotate["+axis+"][(][-]?[0-9]+/g");
                    arr[j].style.transform = str1.replace(reg1,str1.match(reg1)[0].replace(/[-]?\d+/,now));
                }
                if (end<now) {
                    now-=5;
                } else if (end===now) {
                    clearInterval(timer);
                    isChose.twisting = false;
                    switchCage(dir);
                    if (isCompleted("front",1)&&isCompleted("right",2)
                        &&isCompleted("back",3)&&isCompleted("left",4)
                        &&isCompleted("top",5)&&isCompleted("bottom",6)){
                        alert("Congratulations!");
                    }
                }
            }
        }
        var timer = setInterval(move,16.66);
    }
}

function getCur(axis){
    //遍历当前块.core，获取当前rotate值：
    var x,
        y,
        z,
        str = isChose.blocks[0].style.cssText,
        reg = /[-]?\d+/g;
    x = reg.exec(str)[0];
    y = reg.exec(str)[0];
    z = reg.exec(str)[0];
    switch (axis) {
        case "X":
            return x;
        case "Y":
            return y;
        case "Z":
            return z;
    }
}

function switchCage(dir) {
    var arr= isChose.blocks,
        axis = axisJudge(),
        ubs = isChose.ubs,
        resortCages = isChose.resortCages;
    // console.log(arr);
    for (var i=0;i<arr.length;i++) {
        //加入arr的块的编号总是从从大到小按顺序排列的。为了配合旋转变换父cage。
        //现将当前所有cage的core删除并返回保存到一个新的数组，按1,2,3,8,5,4,7,6,5的顺序。
        switch (i) {
            case 0:
                var r1 = arr[i].parentNode;
                resortCages[0]=r1;
                var ub1 = r1.removeChild(arr[i]);
                ubs[0]=ub1;
                break;
            case 1:
                var r2 = arr[i].parentNode;
                resortCages[1]=r2;
                var ub2 = r2.removeChild(arr[i]);
                ubs[1]=ub2;
                break;
            case 2:
                var r3 = arr[i].parentNode;
                resortCages[2]=r3;
                var ub3 = r3.removeChild(arr[i]);
                ubs[2]=ub3;
                break;
            case 3:
                var r8 = arr[i].parentNode;
                resortCages[7]=r8;
                var ub8 = r8.removeChild(arr[i]);
                ubs[7]=ub8;
                break;
            case 4:
                //中间块情况特殊，不需换父cage，但与后方自转问题相同，转完需要将transform归位，
                // 否则下次旋转可能因为rotate旋转后的坐标轴变动而发生奇怪的转动。
                arr[i].style.transform = "rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
                break;
            case 5:
                var r4 = arr[i].parentNode;
                resortCages[3]=r4;
                var ub4 = r4.removeChild(arr[i]);
                ubs[3]=ub4;
                break;
            case 6:
                var r7 = arr[i].parentNode;
                resortCages[6]=r7;
                var ub7 = r7.removeChild(arr[i]);
                ubs[6]=ub7;
                break;
            case 7:
                var r6 = arr[i].parentNode;
                resortCages[5]=r6;
                var ub6 = r6.removeChild(arr[i]);
                ubs[5]=ub6;
                break;
            case 8:
                var r5 = arr[i].parentNode;
                resortCages[4]=r5;
                var ub5 = r5.removeChild(arr[i]);
                ubs[4]=ub5;
                break;
        }

    }
    // console.log(resortCages);
    // console.log(ubs);
    //切换Cage后rotate重置：
    // if(dir===1){
    if (((axis==="Y")&&(dir===1))
        ||((axis==="X")&&(dir===-1))
        ||((axis==="Z")&&(dir===1))) {
        var t1 = ubs.pop();
        ubs.unshift(t1);
        var t2 = ubs.pop();
        ubs.unshift(t2);
        for (var k=0;k<resortCages.length;k++) {
            //console.log(ubs[k]);
            resortCages[k].appendChild(ubs[k]);
            ubs[k].style.transform = "rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
        }
    // } else if(dir===-1) {
    } else if (((axis==="X")&&(dir===1))
        ||((axis==="Y")&&(dir===-1))
        ||((axis==="Z")&&(dir===-1))) {
        var t3=ubs.shift();
        ubs.push(t3);
        var t4=ubs.shift();
        ubs.push(t4);
        for (var l=0;l<resortCages.length;l++) {
            //console.log(ubs[l]);
            resortCages[l].appendChild(ubs[l]);
            ubs[l].style.transform = "rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
        }
    }
    //但此时各个.core的朝向与初始生成时相同，会造成没有颜色的面外露的情况。
    //把转层当作“公转”的话，此时就需要把.core内的.unit-block进行“自转”,
    //要注意，rotate转的是坐标轴,X转了,Y和Z就会变，因此以下公转自转同步的思路第二次转会出错，没错的是巧合！
    // (function (){
    //     var reg = eval("/rotate["+axis+"][(][-]?[0-9]+/g");
    //     for (var j=0,t,unit,str;j<arr.length;j++) {
    //         t = parseFloat(arr[j].querySelector(".unit-block").style.transform
    //             .match(reg)[0].match(/[-]?\d+/)[0]);
    //         t+=(90*dir);
    //         // console.log(t);
    //         unit =arr[j].firstElementChild;
    //         str = unit.style.transform;
    //         unit.style.transform = str.replace(reg,str.match(reg)[0].replace(/[-]?\d+/,t));
    //     }
    // })();
    //另一条思路：
    //自转不是真实的转，而是瞬间交换ub面的颜色,但这么做原结构的.core就有点多余了...：
    //如果是X轴的层顺时针转，ub面1→5→3→6→1这样交换，
    //如果是X轴的层逆时针转，ub面1→6→3→5→1这样交换，
    //如果是Y轴的层顺时针转，ub面1→2→3→4→1这样交换，
    //如果是Y轴的层逆时针转，ub面1→4→3→2→1这样交换，
    //如果是Z轴的层顺时针转，ub面2→6→4→5→2这样交换，
    //如果是Z轴的层逆时针转，ub面2→5→4→6→2这样交换。
    (function () {
        switch (axis) {
            case "X":
                switchFaces(arr,dir,0,4,2,5);
                break;
            case "Y":
                switchFaces(arr,dir,0,1,2,3);
                break;
            case "Z":
                switchFaces(arr,dir,1,5,3,4);
                break;
        }
    })();
}

function switchFaces (arr,dir,ind1,ind2,ind3,ind4) {
    var faces,
        f =[],
        c =[];
    for (var i=0;i<arr.length;i++) {
        faces = arr[i].querySelectorAll(".unit-block>div");
        f=[faces[ind1],faces[ind2],faces[ind3],faces[ind4]];
        c=[ faces[ind1].style.backgroundColor,faces[ind2].style.backgroundColor,
            faces[ind3].style.backgroundColor,faces[ind4].style.backgroundColor];
        if (dir===1) {
            var t1=c.pop();
            c.unshift(t1);
            for (var j=0;j<4;j++) {
                f[j].style.backgroundColor=c[j];
            }
        } else if (dir===-1) {
            var t2=c.shift();
            c.push(t2);
            for (var k=0;k<4;k++) {
                f[k].style.backgroundColor=c[k];
            }
        }
    }
}

/*魔方完成判断函数组==========================*/
function isCompleted(cages,whichFace) {
    var sameLayer = document.querySelectorAll("."+cages+" .unit-block>div:nth-child("+whichFace+")");
    for (var i=0,color;i<sameLayer.length;i++) {
        color = sameLayer[0].style.backgroundColor;
        if (sameLayer[i].style.backgroundColor!==color) {
            return false;
        }
    }
    return true;
}