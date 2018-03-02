///////////////////////////////////////////////
// Radiant Live
///////////////////////////////////////////////
// Main JavaScript methods to process the
// Ableton Live set
///////////////////////////////////////////////


///////////////////////////////////////////////
// Global Setup
///////////////////////////////////////////////

// Number of I/O
outlets = 1;

///////////////////////////////////////////////
// Main Application
///////////////////////////////////////////////

function RadiantLive() {
    this.name = 'Radiant Live';
}

RadiantLive.prototype._log = function (message) {
    post(this.name + ': ' + message + '\n');
};

RadiantLive.prototype._getLiveApi = function (path) {
    if (!this.liveApi) {
        this.liveApi = new LiveAPI(null, path);
    } else {
        this.liveApi.path = path;
    }

    return this.liveApi;
};

RadiantLive.prototype._getTrackInformation = function (trackPath) {
    var liveApi = this._getLiveApi(trackPath);
    var trackPath = liveApi.path;
    var trackColor = liveApi.get('color');
    var trackName = liveApi.get('name').toString();
    var clipSlotCount = liveApi.getcount('clip_slots');

    return {
        trackPath: trackPath,
        trackColor: trackColor,
        trackName: trackName,
        clipSlotCount: clipSlotCount
    };
};

RadiantLive.prototype._getClipSlotInformation = function (clipSlotPath) {
    var liveApi = this._getLiveApi(clipSlotPath);
    var hasClipRaw = liveApi.get('has_clip')
    var hasClip = parseInt(hasClipRaw, 10);

    return {
        hasClip: hasClip === 1
    };
};

RadiantLive.prototype._processTrack = function (track) {
    this._log('Processing Track ' + track.trackName);

    for (var j = 0; j < track.clipSlotCount; j++) {
        var clipSlotPath = track.trackPath.replace(/['"]+/g, '') + ' clip_slots ' + j; //'
        var clipSlot = this._getClipSlotInformation(clipSlotPath);

        if (clipSlot.hasClip) {
            var clipPath = clipSlotPath + ' clip';
            var clipApi = this._getLiveApi(clipPath);

            clipApi.set('color', track.trackColor);

            var isClickTrack = track.trackName.indexOf('Click Track', 0) >= 0;
            var isControlTrack = track.trackName.indexOf('CONTROL', 0) >= 0;

            if(isClickTrack) {
                var clipName = clipApi.get('name');

                var scenePath = 'live_set scenes ' + j;
                var sceneApi = this._getLiveApi(scenePath);
                sceneApi.set('name', clipName);
            } else {
                // We don't want to rename control scenes since they are descriptive
                if(!isControlTrack) {
                    if (track.trackName.indexOf('OUT-') > 0) {
                        var output = track.trackName.replace(/[A-z\-]+/g, '');
                        this._log('Group encountered. Setting output to ' + output + '.');
                    }
    
                    clipApi.set('name', track.trackName);
                }
            }
        }
    }
};

RadiantLive.prototype.processTracksAndClips = function () {
    this._log('Starting to Process Tracks and Clips.')

    var liveApi = this._getLiveApi('live_set');
    var trackCount = liveApi.getcount('tracks');

    for (var i = 0; i < trackCount; i++) {
        var trackPath = 'live_set tracks ' + i;
        var track = this._getTrackInformation(trackPath);

        this._processTrack(track);
    }
};

// Main entry point into the application
function process() {
    var radiantLive = new RadiantLive();
    radiantLive.processTracksAndClips();
}