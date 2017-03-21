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
            server: '',
            site:''
        },
        production : {
            server: '',
            site:''
        }
    }
};
var currentServer = serverList[nodeEnv.agent][nodeEnv.env];