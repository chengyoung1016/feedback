# 功能说明
目前阶段实现了节点、摄像头、动画、音频的反馈
# 目录结构
* **FeedbackCtrl**       ***反馈系统控制入口***
* **FeedbackBase**       ***反馈模块基类，所有反馈模块都继承该基类***
* **FeedbackDefine**     ***反馈系统相关定义***
* **IFeedback**          ***反馈系统接口定义***
* **FeedbackNode**       ***节点反馈模块***
* **FeedbackCamera**     ***摄像头反馈模块***
* **FeedbackAnimation**  ***帧动画反馈模块***
* **FeedbackAudio**      ***音频反馈模块***
# 使用说明
1.把入口脚本"FeedbackCtrl"拖到目标节点，然后勾勾选选填填。
2.在需要的地方调用FeedbackCtrl的execute方法执行反馈操作
3.支持指定反馈模块id来执行对应的反馈操作,调用FeedbackCtrl的executeById即可。
```typescript
    ///test
    this.scheduleOnce(() => {
        //执行所有反馈模块
        this.execute();
        //执行指定反馈模块
        // this.executeById(FeedbackTypeEnum.NODE);
    }, 2)
```
# 注意事项
1.节点反馈模块只支持单个节点的单个动作，若需多个节点多个动作执行，可多建几个FeedbackCtrl，建议另外实现；
2.如果选择sequence模式，则会根据反馈模块组件在编辑器面板的索引顺序依次执行，若需多次执行，则每次执行的间隔时间要保证大于所有反馈模块Duration的总和；
3.如果某个反馈模块是无限次播放，则不能选择sequence模式或者，将该反馈放在sequence最后，尽量不要使用这种方式；
4.选择spawn模式时，若需要重复多次执行，注意每次执行的间隔时间要保证大于所有反馈模块的Duration最大值；
5.该反馈系统的所有反馈操作再执行完后，都会回到初始状态，如若有其他需求自己改动实现
例如：某节点的初始位置为（0，0），再执行移动反馈到（200，200）完毕之后，节点位置会重置到（0，0）初始位置。
