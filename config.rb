###
# Compass
###

# Change Compass configuration
# compass_config do |config|
#   config.output_style = :compact
# end

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", :layout => false
#
# With alternative layout
# page "/path/to/file.html", :layout => :otherlayout
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end

# Proxy pages (http://middlemanapp.com/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", :locals => {
#  :which_fake_page => "Rendering a fake page with a local variable" }

###
# Helpers
###

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

# Reload the browser automatically whenever files change
# activate :livereload

require 'json'

ARTWORK_FOLDER = File.expand_path('../source/img/artwork', __FILE__)

class Project
  def self.is_a_project?(project_folder)
    File.directory?(project_folder)
  end

  def self.read_from_project_config
    projects = []

    projects_config['projects'].each do |project_name|
      path = File.join(ARTWORK_FOLDER, project_name)

      if is_a_project?(path)
        project = self.new(path)
        projects.push(project) if project.has_artwork?
      end
    end
    projects
  end

  def self.each(&blck)
    @projects = read_from_project_config
    @projects.each(&blck)
  end

  def self.projects_config
    JSON.parse(File.read(projects_config_path))
  end

  def self.projects_config_path
    File.join(ARTWORK_FOLDER, 'projects.json')
  end

  def initialize(path)
    @path = path
  end

  def has_artwork?
    !artwork.empty?
  end

  def artwork
    Dir[File.join(@path, '*.jpg')].map {|i| i.gsub(/^#{@path}\//, '')}
  end

  def name
    @path.gsub(/^#{ARTWORK_FOLDER}\//, '')
  end

  def data
    JSON.parse(File.read(data_file))
  end

  def data_file
    File.join(@path, 'data.json')
  end

  def thumbnail
    data['thumbnail']
  end

  def label
    data['label']
  end

  def sub_label
    data['sub-label']
  end

  def cover_image
    data['cover']
  end

  def uses_dark_controls?
    data['dark-controls']
  end

  def description
    File.read(description_file)
  end

  def description_file
    File.join(@path, 'description.md')
  end
end

set :project, Project

Project.each do |project|
  proxy "/project/#{project.name}.html", "/portfolio-item.html", :locals => { :active_project => project }
end

# Methods defined in the helpers block are available in templates
helpers do
  def project_image(project, image, size)
    thumbnail_url("artwork/#{File.join(project.name, image)}", size, :include_images_dir => true)
  end

  def portfolio_item(options = {})
    project = options.delete(:project)

    %Q{
			<li data-thumb="/#{project_image(project, project.cover_image, :thumb)}" data-src="/#{project_image(project, project.cover_image, :large)}" data-cover="cover" href="/project/#{project.name}.html">
				<div class="slideshow__label black">
					<p>
						<strong>#{project.name}</strong>
						<span>#{project.sub_label}</span>
					</p>
				</div>
			</li>
    }
  end

  def markdown(markdown_source)
    markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML, :autolink => true)
    html = markdown.render(markdown_source)

    # Enable the custom ~~~ tag
    html.gsub!('<p>~~~</p>', '<hr class="dotted">')

    html
  end
end

require "middleman-thumbnailer"
activate :thumbnailer,
   :dimensions => {
     :thumb => '130x100',
     :small => '380x285',
     :medium => '730x220',
     :large => '1400x900'
   },
   :include_data_thumbnails => true

set :css_dir, 'css'

set :js_dir, 'js'

set :images_dir, 'img'

# Build-specific configuration
configure :build do
  # For example, change the Compass output style for deployment
  # activate :minify_css

  # Minify Javascript on build
  # activate :minify_javascript

  # Enable cache buster
  # activate :asset_hash

  # Use relative URLs
  # activate :relative_assets

  # Or use a different image path
  # set :http_prefix, "/Content/images/"
end
