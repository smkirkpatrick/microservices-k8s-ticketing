import mongoose from 'mongoose';
import { Password } from '../services/password';

// This Mongoose Model represents the entire user
// collection in mongodb.

// An interface that describes the properties that are
// required to create a new user.
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that a
// user model has.
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties that a
// User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.pre('save', async function (done) {
  // ^ have to use the 'function(done)' syntax to preserve use
  // of 'this' as the User document. Using an arrow func '(done) =>'
  // would clobber 'this' and set it to the current context.
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }

  done(); // have to call for mongo to continue
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
