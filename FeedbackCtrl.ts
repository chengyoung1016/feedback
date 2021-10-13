import FeedbackBase from "./FeedbackBase";
import { FeedbackExecuteEnum, FeedbackTypeEnum } from "./FeedbackDefine";

const {ccclass, property, disallowMultiple} = cc._decorator;

/**
 * @classdesc 反馈系统管理类
 * @description 提供给用户操作整个反馈系统的组件，用户只需要勾选对应功能，然后设置每个反馈模块对应的属性即可使用
 * *****用法：组件脚步拖拽到对应节点即可使用*****
 * @note 
 * 1.如果选择sequence模式，则会根据反馈模块组件在编辑器面板的索引顺序依次执行，若需多次执行，则每次执行的间隔时间要保证大于所有
 *   反馈模块Duration的总和
 * 2.如果某个反馈是无限次播放，则不能选择sequence模式或者将该反馈放在sequence最后，尽量不要使用这种方式
 * 3.选择spawn模式时，若需要重复多次执行，注意每次执行的间隔时间要保证大于所有反馈模块的Duration最大值
 * @author chengzhengyang
 * @since 2020-12-24
 */
@ccclass
@disallowMultiple
export default class FeedbackCtrl extends FeedbackBase {
    //节点反馈
    @property
    private _nodeFb: boolean = false;
    @property({
        displayName: "节点",
        tooltip: CC_DEV && "节点反馈相关，例如节点移动、缩放、旋转等"
    })
    get nodeFb(): boolean {
        return this._nodeFb;
    }
    set nodeFb(value: boolean) {
        this.notify(FeedbackTypeEnum.NODE, value);
        this._nodeFb = value;
    }

    //摄像头反馈
    @property
    private _cameraFb: boolean = false;
    @property({
        displayName: "摄像头",
        tooltip: CC_DEV && "摄像头反馈相关，例如震屏、镜头拉伸等"
    })
    get cameraFb(): boolean {
        return this._cameraFb;
    }
    set cameraFb(value: boolean) {
        this.notify(FeedbackTypeEnum.CAMERA, value);
        this._cameraFb = value;
    }

    //帧动画反馈
    @property
    private _animationFb: boolean = false;
    @property({
        displayName: "帧动画",
        tooltip: CC_DEV && "帧动画反馈，主要包括动画的播放、暂停等"
    })
    get animationFb(): boolean {
        return this._animationFb;
    }
    set animationFb(value: boolean) {
        this.notify(FeedbackTypeEnum.ANIMATION, value);
        this._animationFb = value;
    }

    //音频反馈
    @property
    private _audioFb: boolean = false;
    @property({
        displayName: "音频",
        tooltip: CC_DEV && "音频反馈，主要包含音频播放、暂停等等"
    })
    get audioFb(): boolean {
        return this._audioFb;
    }
    set audioFb(value: boolean) {
        this.notify(FeedbackTypeEnum.AUDIO, value);
        this._audioFb = value;
    }

    notify(type: FeedbackTypeEnum, isEnable: boolean) {
        let feedback: string = "";
        switch (type) {
            case FeedbackTypeEnum.CAMERA:
                feedback = "FeedbackCamera";
                break;
            case FeedbackTypeEnum.NODE:
                feedback = "FeedbackNode";
                break;
            case FeedbackTypeEnum.ANIMATION:
                feedback = "FeedbackAnimation";
                break;
            case FeedbackTypeEnum.AUDIO:
                feedback = "FeedbackAudio";
                break;
        }

        let com = this.node.getComponent(feedback);
        if (isEnable) {
            //特殊情况：勾选时已经存在该反馈组件了
            if (com) {return;}
            this.node.addComponent(feedback);
        } else {
            this.node.removeComponent(feedback);
        }
    }

    @property({
        type: cc.Enum(FeedbackExecuteEnum),
        displayName: "执行模式",
        tooltip: "该反馈模块的执行模式"
    })
    ExecuteType: FeedbackExecuteEnum = FeedbackExecuteEnum.SPAWN;

    //反馈模块列表
    private _feedbacks: {[id: number]: FeedbackBase} = {};
    getFeedback(id: string): FeedbackBase {
        if (this._feedbacks[id]) {
            return this._feedbacks[id];
        }
        return null;
    }
    setFeedback(id: string, feedback: FeedbackBase) {
        this._feedbacks[id] = feedback;
    }

    start() {
        let feedback = this.getComponents(FeedbackBase);
        feedback.splice(0, 1);
        feedback.map((item) => {
            this.setFeedback(item.feedbackId, item);
        })

        ///test
        this.scheduleOnce(() => {
            this.execute();
            // this.executeById(FeedbackTypeEnum.NODE);
        }, 2)
        
    }

    //初始化所有反馈模块
    init() {
        this._isPlaying = false;
    }

    reset() {
        this.init();
    }

    /**
     * 执行指定反馈模块
     * @param id 反馈模块id
     */
    executeById(id: string) {
        let feedback = this.getFeedback(id);
        if (feedback) {
            feedback.execute();
        }
    }

    async play() {
        if (this._feedbacks == {}) {
            return;
        }
        this._isPlaying = true;
        switch(this.ExecuteType) {
            case FeedbackExecuteEnum.SPAWN:
                this.feedbackSpawn();
                break;
            case FeedbackExecuteEnum.SEQUENCE:
                this.feedbackSequence();
                break;
        }
    }

    stopById(id: string) {
        let feedback = this.getFeedback(id);
        if (feedback && feedback.isPlaying()) {
            feedback.stop();
        }
    }

    stop() {
        this._isPlaying = false;
        for (let k in this._feedbacks) {
            this.stopById(k);
        } 
    }

    feedbackSpawn() {
        let tween = cc.tween(this.node)
        .call(() => {
            this.playSpawn();
        })
        tween = this.feedbackRepeat(tween);
        tween.start();
    }

    playSpawn() {
        for (let k in this._feedbacks) {
            this._feedbacks[k].execute();
        }
    }

    feedbackSequence() {
        let tween = cc.tween(this.node)
        .call(() => {
            this.playSequence();
        })
        tween = this.feedbackRepeat(tween);
        tween.start();
    }

    async playSequence() {
        for (let k in this._feedbacks) {
            await this._feedbacks[k].execute();
        }
    }
}
