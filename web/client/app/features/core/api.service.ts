namespace screeps.core {
    'use strict';

    export interface IAPI {
        getJobQueue: (roomID : string) => ng.IPromise<any>;
        getRooms: () => ng.IPromise<any>;
        getCreeps: (roomID : string) => ng.IPromise<any>;
        getRoom: (roomID : string) => ng.IPromise<any>;
        getStorage: (roomID : string) => ng.IPromise<any>;
    }

    export class API implements IAPI {
        constructor(private $http: ng.IHttpService,
                    private $q: ng.IQService) {

        }

        getRooms: () => ng.IPromise<any> = () =>
            this.$http.get('/api/rooms')
                .then(this.success)
                .catch(this.fail);

        getJobQueue: (roomID) => ng.IPromise<any> = (roomID) =>
            this.$http.get('/api/job-queue?room=' + roomID)
                .then(this.success)
                .catch(this.fail);

        getCreeps: (roomID) => ng.IPromise<any> = (roomID) =>
            this.$http.get('/api/creeps?room=' + roomID)
                .then(this.success)
                .catch(this.fail);

        getRoom: (roomID) => ng.IPromise<any> = (roomID) =>
            this.$http.get('/api/room?room=' + roomID)
                .then(this.success)
                .catch(this.fail);

        getStorage: (roomID) => ng.IPromise<any> = (roomID) =>
            this.$http.get('/api/storage?room=' + roomID)
                .then(this.success)
                .catch(this.fail);

        private success: (response: any) => {} = (response) => response.data;

        private fail: (error: any) => {} = (error) => {
            var msg = error.data.description;
            return this.$q.reject(msg);
        }
    }

    angular
        .module('screeps.core')
        .service('api', API);
}
