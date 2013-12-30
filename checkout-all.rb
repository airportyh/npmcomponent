require 'json'

pkgs = JSON.parse(File.read('all.json'))

pkgs.each do |pkg|
  if pkg
    repo = pkg['repo']
    dirname = "repos/#{repo.split('/').join('-')}"
    url = "git://github.com/#{repo}.git"
    puts "Cloning #{url} into #{dirname}"
    # TODO: to solve incorrectly cased urls, use the https://api.github.com/repos/{acct}/{repo}
    # API to get the clone_url
    `git clone #{url} #{dirname}`
  end
end