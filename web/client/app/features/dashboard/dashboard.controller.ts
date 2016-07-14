namespace screeps.dashboard {
    import IIntervalService = angular.IIntervalService;
    'use strict';

    interface IDashboardVm {
        creeps: Object;
        room: Object;
        storage: Object;
    }

    class DashboardController implements IDashboardVm {
        creeps = {};
        room = {};
        storage = {};

        constructor(private api: screeps.core.IAPI,
                    private $rootScope,
                    $interval : IIntervalService) {
            this.getCreeps();
            this.getRoom();
            this.getStorage();
            $interval(this.getCreeps.bind(this), 2000);
            $interval(this.getStorage.bind(this), 10000);
            $interval(this.getRoom.bind(this), 30000);
        }

        getCreeps() {
            var self = this;

            this.api.getCreeps(this.$rootScope.selectedRoomID).then(function(creeps : Object) {
                self.creeps = creeps;
            })
        }

        getStorage() {
            var self = this;

            this.api.getStorage(this.$rootScope.selectedRoomID).then(function(storage : Object) {
                self.storage = storage;
            })
        }

        getRoom() {
            var self = this;

            this.api.getRoom(this.$rootScope.selectedRoomID).then(function(room : Object) {
                self.room = room;
            })
        }
    }

    angular.module('screeps.dashboard')
        .controller('DashboardController', DashboardController);
}
