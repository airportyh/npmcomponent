NPM-Component
=============

This project aims to make all 1700+ (and counting) modules in [Component](https://github.com/component/component/) available to [npm](https://www.npmjs.org/)/[browserify](http://browserify.org/) users - without the intervention of any of the modules' authors.

## How?

Each component from the [Component registry](https://github.com/component/component/wiki/Components) is mirrored in a separate Github repo - which is modified to work properly in the context of npm.

For example, to install [component/dialog](https://github.com/component/dialog) via npm, you'd do:

    npm install npmcomponent/component-dialog

In general, `component install <username>/<repo>` is mapped to `npm install npmcomponent/<username>-<repo>`.

[npmcomponent](https://github.com/npmcomponent) is a just a Github user, it could also have been an organization.

## What are the scripts in here?

The main scripts of interest are 

* `bin/fetch` - this fetchs the `all.json` file from the server hosting the component registery.
* `bin/gather` - goes through `all.json`, removes duplicates, sorts them, and saves to `repos.json`.
* `bin/sync` - goes through repos.json and syncs each one from the original repo down to local, modifies it, and then syncs it back up to the corresponding repo on npmcomponent.

All scripts assume the existence of `credentials.json` which contains the "username" and "password" for the npmcomponent account, which are, of course, secret. The other scripts in the `bin` directory are used for quick/interactive testing.

* `bin/delete <username>/<repo>` - delete the mirrored of target repo.
* `bin/delete_all` - delete all mirrors.
* `bin/remaining` - summarizes stats of how many repos have been mirrored, and how many failed to mirror, etc.
* `bin/init <username>/<repo>` - initializes a local mirror of target repo.
* `bin/reset_master <username>/<repo>` - `git reset --hard HEAD` the cloned repos of the target repo.
* `bin/check_names` - a script to check if all the repo names are still available on npm, for when and if I want to publish them all.
* `bin/count-repos` - count the number of repos on Github under npmcomponent.

## How often do you run these scripts?

The plan is to setup a cron job on some machine to run them every hour or every 15 minutes. But, currently I run the scripts every day or so manually - very ghetto, I know. It takes about a minute each time I run it.

## Todo/Yet to be done

* Version handling - currently the mirrors do not take versions into account - only HEAD is modified. I plan to add support by going through all the tags in each repo and modifying them.
* Link back to existing npm modules - currently all repos are mirrored, even repos that were already publish on npm. I want to detect these cases and link to the npm package instead of the mirror.
* Publish all mirrors on npm - I am still weighing the pros and cons of doing this.