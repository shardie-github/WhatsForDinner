export declare const isWeb: boolean;
export declare const isIOS: boolean;
export declare const isAndroid: boolean;
export declare function useDeviceMode(): {
    isWeb: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    platform: string;
};
export declare function getResponsiveValue<T>(mobile: T, tablet?: T, desktop?: T): T;
export declare function getPlatformValue<T>(web: T, mobile: T): T;
//# sourceMappingURL=device.d.ts.map