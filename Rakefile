# With help and code from: https://gist.github.com/overbalance/1005360

desc "Completely empty /build"
task :clobber do
  sh "rm -rf build/* build/.[Dh]*"
end

desc "Builds page"
task :build do
  sh "bundle exec middleman build"
end

desc "Publishes the page"
task :publish => [:build] do
  system("cd build;rsync -rltvz --progress --delete-before -e ssh . zazoo@oleschiesser.de:/var/www/virtual/zazoo/oleschiesser.de/")
end