
import AudioManager from "../utils/audio/AudioManager";
import FeedbackBase from "./FeedbackBase";
import { FeedbackTypeEnum } from "./FeedbackDefine";

const {ccclass, property, disallowMultiple} = cc._decorator;

/**
 * @classdesc 音频反馈
 * @description 音频反馈处理，播放音频，暂停播放等
 * @note
 * 这里选择使用将音频文件拖到组件上的使用方式，是因为拖到组件上引擎会预加载文件，从而获取音频的播放时长
 * 用户使用起来无需考虑再手动去加载音频资源, 若有其他需求考量，可自己修改加载方式
 * @author chengzhengyang
 * @since 2020-12-25
 */
@ccclass
@disallowMultiple
export default class FeedbackAudio extends FeedbackBase {
    @property(cc.AudioClip)
    AudioClip: cc.AudioClip = null;

    private _curAudioId: number = -1;
    private _curDuration: number = -1;

    init() {
        this.feedbackId = FeedbackTypeEnum.AUDIO;
        this._curAudioId = -1;
        this._isPlaying = false;
        this._curDuration = this.AudioClip.duration;
    }

    async play(): Promise<void> {
        return new Promise<void>((resolve) => {
            this._isPlaying = true;
            this._curAudioId = cc.audioEngine.playEffect(this.AudioClip, false);
            this.scheduleOnce(() => {
                this.end();
                resolve();
            }, this._curDuration);
        })
        .catch(e => {
            throw new Error("feedback audio play Err:" + e);
        })
    }

    stop() {
        if (this._curAudioId != -1) {
            AudioManager.getInstance().stopSFX(this._curAudioId);
        }
    }

}
