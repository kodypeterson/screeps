module.exports = function(creep, job) {
    var source = Game.getObjectById(job.params.source);
    var result = creep.harvest(source);
    switch (result) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(source);
            break;
    }
};