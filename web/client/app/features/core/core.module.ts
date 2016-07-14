/// <reference path="api.service.ts" />

import {IStateService} from "angular-ui-router";
import {IUrlRouterProvider} from "angular-ui-router";
namespace screeps.core {
    import IStateProvider = angular.ui.IStateProvider;
    import ILocationService = angular.ILocationService;
    import ILocationProvider = angular.ILocationProvider;
    import ITimeoutService = angular.ITimeoutService;
    'use strict';

    export interface IScreepsRootScope extends ng.IRootScopeService {
        selectedRoomID: string;
        rooms: Array<string>;
    }

    angular
        .module('screeps.core', [

        ])
        .config(CoreConfiguration)
        .run(CoreRun);

    /* @ngInject */
    function CoreConfiguration($locationProvider : ILocationProvider, $urlRouterProvider : IUrlRouterProvider) {
        $locationProvider.html5Mode(true);
        var init = true;
        $urlRouterProvider.rule(function ($injector, $location) {
            if (init && $location.path() !== '/') {
                $location.replace().url('/?redir=' + $location.path());
            }
            init = false;
        });
    }

    /* @ngInject */
    function CoreRun($rootScope) {
        $rootScope.selectedRoomID = 'N/A';
    }
}
