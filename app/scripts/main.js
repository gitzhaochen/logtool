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
                    +'<th width="10%"><input type="checkbox" class="checkAll" id="checkAll"/><label for="checkAll">全选</label></th>'
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
//渲染单个日志 render group
function renderGroup(groupdata){
    var temp='<div class="group group_'+groupdata.groupId+'"><div class="log-title">日志编号：'+groupdata.logid+'</div>';
    temp+='<table class="wj-table">'
        +'<tr>'
        +'<th width="35%">errorCode</th>'
        +'<th width="35%">errorText</th>'
        +'<th width="30%">errorPos</th>'
        +'</tr></table>';

    temp+='<div class="calc-loading">正在拼命计算中...</div></div>';
    return temp;
}
//逐行分析结果渲染dom
function renderLog(logdata){
    var temp;
    temp+='<tr>'
            +'<td>'+logdata.errcode+'</td>'
            +'<td>'+ logdata.errtext+'</td>'
            +'<td>第'+ logdata.pos+'行</td>'
        '+</tr>';
    return temp;
}
//根据SN号获取数据
var dataLists;
$('.get-data-btn').click(function(){
    var sn=$('.sn-input').val();//获取sn号
    if(sn.length==0){
        alert('请输入SN号码！');
        $('.sn-input').focus();
        return;
    };
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

//全选操作
    $('.wj-table-responsive').on('click','#checkAll',function(){
        if(!!$(this).prop('checked')){
            $(this).prop('checked',true);
            $('.checkbox').each(function(){
                $(this).prop('checked',true);
            });
        }else{
            $(this).prop('checked',false);
            $('.checkbox').each(function(){
                $(this).prop('checked',false);
            });
        }
    })
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
$('.zdfx-btn').click(function(){
    checkLogsArr.length=0;
    $('.checkbox').each(function(){
        if(!!$(this).prop('checked')){
            checkLogsArr.push($(this).data('num'))
        }
    });
    if(checkLogsArr.length==0){
        alert('请勾选要分析的日志！');
        return;
    };
    var ajaxCount=0;//已完成的请求数
    $('.logscont').empty();
    if($(".loading").hasClass("hide")){
        $(".loading").removeClass("hide")
    };
    //先渲染日志group
    for(var k=0;k<checkLogsArr.length;k++) {
        (function (k) {
            var groupdata = {logid: dataLists[checkLogsArr[k]].bugid,groupId:k};
            var temp = renderGroup(groupdata);
            $('.logscont').append(temp);
        })(k);
    }
    //逐个发请求
    for(var k=0;k<checkLogsArr.length;k++){
        (function(k){
            var $table=$('.group_'+k).find('.wj-table');//该篇日志所在dom
            var $calc=$('.group_'+k).find('.calc-loading');//正在计算提示
            function getLogData(){
                var defer = $.Deferred();
                $.ajax({
                    url:dataLists[checkLogsArr[k]].url,
                    type: "GET",
                    cache: false,
                    contentType:"text/plain",
                    success: function(res){
                        defer.resolve(res)
                    },
                    error: function(err){
                        defer.reject(err);
                    },
                    complete: function(){
                        $calc.remove();
                        ajaxCount++;
                        //所有请求完成 可再次点击分析
                        if(ajaxCount==checkLogsArr.length){
                            if(!$(".loading").hasClass("hide")){
                                $(".loading").addClass("hide");
                            }
                        };

                    }
                });
                return defer.promise();
            };
            $.when(getLogData()).then(function(res){
                var resArr=res.split(/\n/g);//日志分割换行符转化成数组
                var flag=true;//该日志是否正常
                var errResArr=[];//查找到的错误日志 存进数组
                for(var i=0;i<resArr.length;i++){
                    for(var j=0;j<errArr.length;j++){
                        //日志逐行 匹配 错误映射表 返回 当前行数pos及错误信息errtext
                        if(resArr[i].indexOf(errArr[j].value)!=-1){
                            flag=false;
                            var logdata={pos:i+1,errcode:errArr[j].value,errtext:errArr[j].text};
                            if(!hasItem(errResArr,logdata).flag){
                                errResArr.push({errcode:logdata.errcode,errtext:logdata.errtext,posArr:[logdata.pos]});
                                var temp=renderLog(logdata);
                                $table.append(temp);
                            }else{
                                var index=hasItem(errResArr,logdata).idx//errorcode已经存在的索引位置
                                errResArr[index].posArr.push(logdata.pos);
                                $table.find('tr').eq(index+1).find('td:last-child').html('第'+errResArr[index].posArr.join()+'行')
                            };

                        }
                    }
                };
                if(flag){
                    //正常日志提示
                    $table.append(
                        '<tr><td colspan="3">无日志信息，请确认用户是否已上传日志！</td></tr>'
                    );
                };
            },function(err){
                $table.append(
                    '<tr><td colspan="3">获取日志数据失败[404]</td></tr>'
                );
            })
        })(k);
    };

});

})();