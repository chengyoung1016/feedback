/**
 * @interface 反馈系统接口
 * @author chengzhengyang
 * @since 2020-12-25
 */
export default interface IFeedback {
    Chance: number;
    init(): void;
    reset(): void;
    isPlaying(id?: number): boolean;
    play(id?: number): void;
    stop(id?: number): void;
}

/**
 * 时间参数接口
 */
export interface IFeedbackTimingParam {
    //延迟时间
    StartDelay: number;
    //重复次数 -1表示无限
    RepeatTimes: number;
    //两次循环播放间的间隔
    RepeatInterval: number;
}