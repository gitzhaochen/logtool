/**
 * Created by hc on 2016/10/22.
 */
var nodeEnv = {
    env: 'test',
    agent: 'yg'
};
var serverList = {
    yg: {
        test: {
            server: 'http://activity.aginomoto.com/activity/gugong',
            site:'http://test-h5.aginomoto.com/web/activity/20161219'
        },
        production : {
            server: 'http://activity.aginomoto.com/activity/gugong',
            site:'http://portal.aginomoto.com/web/activity/tv/20161219'
        }
    }
};
var currentServer = serverList[nodeEnv.agent][nodeEnv.env];