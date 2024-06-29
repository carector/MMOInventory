const { Model, data} = require('sequelize');

module.exports = {sequelize} => {
        class User extends Model {

        }

        User.init( 
        {
            // TODO
        },
        {
            sequelize,
            indexes: [

            ],
            modelName: 'User', 
            createdAt: 'createdOn',
            updatedAt: 'updatedOn'
        }
    )
}