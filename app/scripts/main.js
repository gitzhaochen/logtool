;(function(){
//数组去重
function concatArr(arr){
    var newArr=[];
    for(var i=0;i<arr.length;i++){
        if(!hasItem(newArr,arr[i]).flag){
            newArr.push({errcode:arr[i].errcode,errtext:arr[i].errtext,posArr:[arr[i].pos]});
        }else{
            newArr[hasItem(newArr,arr[i]).idx].posArr.push(arr[i].pos);
        }
    };
    return newArr;
}
//数组中是否包含该项errcode
function hasItem(arr,item){
    var flag=false,idx=-1;
    for(var i=0;i<arr.length;i++){
        if(item.errcode===arr[i].errcode){
            flag=true;
            idx=i;
            break;
        }
    };
    return {flag:flag,idx:idx};
}
//数据渲染页面
function render(datalists){
    var temp='<table class="wj-table">'
                +'<tr>'
                    +'<th width="10%"></th>'
                    +'<th width="30%">日志URL</th>'
                    +'<th width="30%">日志BugID</th>'
                    +'<th width="30%">上传时间</th>'
                +'</tr>';
    $.each(datalists,function(i,v){
        temp+='<tr>'
                    +'<td><input type="checkbox" class="checkbox" data-num="'+i+'"/></td>'
                    +'<td>'+v.url+'</td>'
                    +'<td>'+ v.bugid+'</td>'
                    +'<td>'+ v.timestr+'</td>'
                '+</tr>';
    });
    temp+='</table>';
    return temp;
};
//日志分析结果渲染dom
function renderLog(logdata){
    var temp='<div class="log-title">'+logdata.logid+'</div>';
     temp+='<table class="wj-table">'
                +'<tr>'
                +'<th width="35%">errorCode</th>'
                +'<th width="35%">errorText</th>'
                +'<th width="30%">errorPos</th>'
                +'</tr>';
    if(logdata.posAndCodeArr.length==0){
        temp+='<tr><td colspan="3">无日志信息，请确认用户是否已上传日志！</td></tr>';
    }else{
        var newArr=concatArr(logdata.posAndCodeArr);
        $.each(newArr,function(i,v){
            temp+='<tr>'
                +'<td>'+v.errcode+'</td>'
                +'<td>'+ v.errtext+'</td>'
                +'<td>第'+ v.posArr.join()+'行</td>'
            '+</tr>';
        });
    }

    temp+='</table>';
    return temp;
}
//根据SN号获取数据
var dataLists;
$('.get-data-btn').click(function(){
    //var sn=$('.sn-input').val();//获取sn号
    //if(sn.length==0){
    //    alert('请输入SN号码！');
    //    $('.sn-input').focus();
    //    return;
    //};
    if($(".loading").hasClass("hide")){
        $(".loading").removeClass("hide")
    };
    $.ajax({
        url:'../data.json',
        type: "GET",
        cache: false,
        contentType:"application/json",
        dataType:"json",
        success: function(res){
            dataLists=res;
            var html=render(res);
            $('.logslist').html(html)
        },
        fail: function(err){
            alert('获取数据失败')
        },
        complete: function(){
            if(!$(".loading").hasClass("hide")){
                $(".loading").addClass("hide");
            }
        }
    })
});


//日志映射表
var errArr=[
{value:'parser error',text:'播放信息解析失败'},
{value:'onReceivePlayEvent event:109',text:'播放器播放错误'},
{value:'UnknownHostException !  url:',text:'用户网络错误'},
{value:'url:http://sports.ptwhaley.gitv.tv/Service/V2/Program',text:'体育点播数据接口访问出错'},
{value:'url:http://vod.ptwhaley.gitv.tv/Service/V3/Program',text:'在线试听点播数据接口访问出错'},
{value:'url:http://whaleykids.aginomoto.com/Service/V3/Program',text:'少儿点播数据接口访问出错'},
{value:'url:http://vod.ptwhaley.gitv.tv/Service/V3/LiveProgram',text:'在线试听直播数据接口访问出错'},
{value:'url:http://vod.ptwhaley.gitv.tv/Service/getLiveStatus',text:'在线试听直播状态接口访问出错'},
{value:'http://sports.aginomoto.com/Service/liveSports',text:'体育直播数据接口访问出错'},
{value:'url:http://sports.aginomoto.com/Service/queryMatchStatus',text:'体育直播状态接口访问出错'},
{value:'url:http://vod.ptwhaley.gitv.tv/Service/findChannelGroup',text:'微鲸LIVE频道组接口访问出错'},
{value:'url:http://vod.ptwhaley.gitv.tv/Service/findItemByChannelId',text:'微鲸LIVE节目单接口访问出错'},
{value:'url:http://tv.ptyg.gitv.tv/i-tvbin/qtv_video/live_details/live_polling',text:'腾讯直播状态接口访问出错'}
];


//日志分析处理
//勾选中的日志索引
var checkLogsArr=[];
$('.wj-table-responsive').on('click','.checkbox',function(){

})

$('.zdfx-btn').click(function(){
    checkLogsArr.length=0;
    $('.checkbox').each(function(){
        if(!!$(this).prop('checked')){
            checkLogsArr.push($(this).data('num'))
        }
    });
    //if(checkLogsArr.length==0){
    //    alert('请勾选要分析的日志！');
    //    return;
    //}
    $('.logscont').empty();
    if($(".loading").hasClass("hide")){
        $(".loading").removeClass("hide")
    };
    for(var k=0;k<checkLogsArr.length;k++){
        (function(k){
            var defer = $.Deferred();
            $.ajax({
                url:dataLists[checkLogsArr[k]].url,
                type: "GET",
                cache: false,
                contentType:"text/plain",
                success: function(res){
                    defer.resolve(res)
                },
                fail: function(err){
                    defer.reject(err);

                },
                complete: function(){
                    if(!$(".loading").hasClass("hide")){
                        $(".loading").addClass("hide");
                    }
                }
            });
            defer.then(function(res){
                var resArr=res.split(/\n/g);//日志分割换行符转化成数组
                var posAndCodeArr=[];//出错日志位置及出错code 映射表
                for(var i=0;i<resArr.length;i++){
                    for(var j=0;j<errArr.length;j++){
                        //日志逐行 匹配 错误映射表 返回 当前行数pos及错误信息errtext
                        if(resArr[i].indexOf(errArr[j].value)!=-1){
                            posAndCodeArr.push({pos:i+1,errcode:errArr[j].value,errtext:errArr[j].text});
                        }
                    }
                };
                var logdata={logid:dataLists[checkLogsArr[k]].bugid,posAndCodeArr:posAndCodeArr};
                var temp=renderLog(logdata);
                $('.logscont').append(temp)
            },function(err){
                alert('获取数据失败')
            })
        })(k);
    };


});

})();