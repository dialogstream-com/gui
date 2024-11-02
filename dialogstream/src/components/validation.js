// Step type definitions and validation
const STEP_TYPES = {
    RTSP: {
        prefix: 'rtsp://',
        validate: (url) => {
            const rtspRegex = /^rtsp:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
            return rtspRegex.test(url);
        },
        error: 'Invalid RTSP URL format. Expected: rtsp://username:password@host:port/path'
    },
    FILE: {
        prefix: 'file:///',
        validate: (path) => {
            return path.startsWith('file:///') && path.length > 8;
        },
        error: 'Invalid file path format. Expected: file:///path'
    },
    SCHEDULE: {
        prefix: 'schedule://',
        validate: (cron) => {
            const cronRegex = /^schedule:\/\/(\S+\s+\S+\s+\S+\s+\S+\s+\S+)$/;
            return cronRegex.test(cron);
        },
        error: 'Invalid schedule format. Expected: schedule://* * * * * (cron format)'
    },
    EMAIL: {
        prefix: 'email:///',
        validate: (email) => {
            const emailRegex = /^email:\/\/\/([\w-\.]+@([\w-]+\.)+[\w-]{2,4})$/;
            return emailRegex.test(email);
        },
        error: 'Invalid email format. Expected: email:///user@domain.com'
    },
    SUBSCRIBE: {
        prefix: 'subscribe://',
        validate: (topic) => {
            return topic.startsWith('subscribe://') && topic.length > 11;
        },
        error: 'Invalid subscribe format. Expected: subscribe://topic'
    },
    PUBLISH: {
        prefix: 'publish://',
        validate: (topic) => {
            return topic.startsWith('publish://') && topic.length > 10;
        },
        error: 'Invalid publish format. Expected: publish://topic'
    },
    PROCESS: {
        prefix: 'process://',
        validate: (process) => {
            return process.startsWith('process://') && process.length > 10;
        },
        error: 'Invalid process format. Expected: process://process_name'
    }
};

const detectStepType = (step) => {
    return Object.entries(STEP_TYPES).find(([_, config]) =>
        step.startsWith(config.prefix)
    )?.[0] || null;
};

const validateStep = (step) => {
    const type = detectStepType(step);
    if (!type) {
        return { isValid: false, error: 'Unknown step type' };
    }

    const isValid = STEP_TYPES[type].validate(step);
    return {
        isValid,
        error: isValid ? null : STEP_TYPES[type].error,
        type
    };
};

export { STEP_TYPES, detectStepType, validateStep };
