var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var userSchema = new mongoose.Schema({
        ids: String,
        first_name:{type:String,require:true},
        last_name: {type:String,require:true},
        user_name:{type:String,require:true},
        email:{type:String,require:true},
        profile_pic:{type:String},
        status_update: String,
        statusDate: String,
        followings :Array,
        followeds :Array,
        password: {type:String,require:true},
        token: {type:String},
        status:{type:String,require:true},
        date_joined: {type:String,require:true},
        resetPasswordToken: String,
        resetPasswordExpires: Date
});
userSchema.methods.generatHarsh = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
};
userSchema.methods.validPassword =function (password) {
    return bcrypt.compareSync(password,this.password);
};
module.exports = mongoose.model('noSelv', userSchema);