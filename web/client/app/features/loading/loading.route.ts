import {IStateProvider} from "angular-ui-router";
namespace screeps.loading {
    import IUrlRouterProvider = angular.ui.IUrlRouterProvider;
    'use strict';

    angular
        .module('screeps.loading')
        .config(appRun);

    /* @ngInject */
    function appRun($stateProvider : IStateProvider, $urlRouterProvider : IUrlRouterProvider) {
        $urlRouterProvider.otherwise("/");

        $stateProvider.state('loading', {
            url: "/?redir",
            templateUrl: "/static/app/features/loading/loading.html",
            controller: 'LoadingController',
            resolve: {
                /* @ngInject */
                requirements: function(api, $rootScope, $location, $stateParams, $state) {
                    return api.getRooms().then(function (rooms) {
                        $rootScope.selectedRoomID = rooms[0];
                        $rootScope.rooms = rooms;
                        var states = $state.get();
                        states.forEach(function(state) {
                            if (state.url === $stateParams.redir) {
                                $state.go(state.name);
                            }
                        });
                    });
                }
            }
        })
    }
}
