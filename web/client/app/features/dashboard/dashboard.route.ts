import {IStateProvider} from "angular-ui-router";
namespace screeps.dashboard {
    'use strict';

    angular
        .module('screeps.dashboard')
        .config(appRun);

    /* @ngInject */
    function appRun($stateProvider : IStateProvider) {
        $stateProvider.state('dashboard', {
            url: "/dashboard/",
            templateUrl: "/static/app/features/dashboard/dashboard.html",
            controller: 'DashboardController',
            controllerAs: 'DashboardControllerVM'
        })
    }
}
