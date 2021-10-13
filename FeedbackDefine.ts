/**
 * 反馈类型
 */
export enum FeedbackTypeEnum {
    //摄像头反馈
    CAMERA = "camera",
    //节点反馈
    NODE = "node",
    //帧动画反馈
    ANIMATION = "animation",
    //音频反馈
    AUDIO = "audio"
}

/**
 * 反馈模块执行模式
 */
export enum FeedbackExecuteEnum {
    //所有反馈模块同时执行
    SPAWN,
    //所有反馈模块按序执行
    SEQUENCE
}

/**
 * 节点反馈类型
 */
export enum FeedbackNodeTypeEnum {
    //无
    NONE,
    //移动
    MOVEBY,
    MOVETO,
    //旋转
    ROTATION,
    //缩放
    ZOOM,
    //晃动
    SHAKE
}

/**
 * 摄像头反馈类型
 */
export enum FeedbackCameraTypeEnum {
    //震动
    SHAKE,
    //缩放
    ZOOM,
}