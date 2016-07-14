namespace screeps.loading {
    'use strict';

    interface ILoadingVm {

    }

    class LoadingController implements ILoadingVm {
        constructor() {
        }
    }

    angular.module('screeps.loading')
        .controller('LoadingController', LoadingController);
}
