// tslint:disable-next-line: no-magic-numbers  // disable magic numbers because of the constants
export const consts = {
    FILE_SYSTEM: "fs",
    EMPTY_ID: '',

    HTTP_STATUS_OK: 200,
    HTTP_STATUS_CREATED: 201,
    HTTP_STATUS_NO_CONTENT: 204,
    HTTP_STATUS_MULTIPLE: 300,
    HTTP_BAD_REQUEST: 400,
    HTTP_CONFLICT: 409,
    HTTP_UNAUTHORIZED: 401,
    HTTP_SERVER_ERROR: 500,

    IMAGE_WIDTH: 640,
    IMAGE_HEIGHT: 480,
    PIXEL_SIZE: 4,
    GOOD_BITDEPTH: '4',

    DEFAULT_RADIUS: 3,
    GOOD_BIT_DEPTH: '4',
    CARDS_BY_PAGE: 2,

    DEFAULT_INITIAL_TIME: 45,
    DEFAULT_PENALTY: 5,
    DEFAULT_TIME_WON: 2,
    DEFAULT_CHEAT_MODE: false,
}

export const constsClue = {
    N_CLUES: 3,

    CLUE_ZONE_TIMEOUT: 1000,

    CLUE1_SCALE: 4,
    CLUE2_SCALE: 2,
    CLUE_ZONE_OPACITY: '0.5',
    NULL_OPACITY: '0',

    CLUE3_INTERVAL_TIMEOUT: 100,

    FIND_DISTANCE_POWER: 2,
}

export const constsSoundSpeed = {
    VERY_FAST: 4.0,
    FAST: 2.0,
    NORMAL: 1.0,
    SLOW: 0.50,

    VERY_FAST_TRESHOLD: 25,
    FAST_TRESHOLD: 75,
    NORMAL_TRESHOLD: 175,
}

export const constsImage = {
    IMAGE_WIDTH: 640,
    IMAGE_HEIGHT: 480,
    PIXEL_SIZE: 4,
    GOOD_BIT_DEPTH: '4',
}

export const constsGame = {
    DEFAULT_INITIAL_TIME: 45,
    DEFAULT_PENALTY: 5,
    DEFAULT_TIME_WON: 2,
    DEFAULT_CHEAT_MODE: false,
}

export const constsTimer = {
    SECONDS_LIMIT: 59,
    MINUTE: 60,
    MAX_STRING_LENGTH: 2,
    INTERVAL_TIMEOUT: 1000,
}
