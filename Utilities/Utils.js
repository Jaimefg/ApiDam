/**
 * Created by jfradera on 28/09/2016.
 */

module.exports.extendUtils = function() {

    global.contentLogger = 0;

    /**
     * Obtiene el ultimo elemento de un array
     */
    if (!Array.prototype.last){
        Array.prototype.last = function(){
            return this[this.length - 1];
        };
    };

    /**
     * Convierte todas las propiedades de un objeto para utilizarlas en una querystring
     */
    if(!Object.prototype.attrToQueryString){
        Object.prototype.attrToQueryString = function () {
            var str = '?', obj = this;
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    str += p + '=' + obj[p] + '&';
                }
            }
            return str.slice(0, -1);
        };
    };


    /**
     * Convierte todas las propiedades de un objeto para utilizarlas en una querystring
     */
    if(!Object.prototype.attrToString){
        Object.prototype.attrToString = function () {
            var str = '', obj = this;
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    str += obj[p] + '|';
                }
            }
            return str.slice(0, -1);
        };
    };


    /**
     * Convierte cualquier objeto en un array
     * @returns {*}
     */
    Object.prototype.toArray = function()
    {
        var list = [];

        if(Array.isArray(this))
            return this;
        else {
            list.push(this);
            return list;
        }
    }


}