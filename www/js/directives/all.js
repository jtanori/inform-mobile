angular.module('directives', [])

.directive('openselect', function () {
    var showDropdown = function (element) {
        var event;
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('mousedown', true, true, window);
        element.dispatchEvent(event);
    };
    return {
        restrict: 'A',
        scope: {
            'el': '@'
        },
        link: function (scope, elem, attrs, ctrl) {
            elem.bind('click', function () {
                var elemento = document.getElementById(scope.el);
                showDropdown(elemento);
            });
        }
    };
});
