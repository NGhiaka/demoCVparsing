<html>
<head>
	
	<link href="css/bootstrap.css" rel="stylesheet" type="text/css">
	<link href="css/style.css" rel="stylesheet" type="text/css">

	<script type="text/javascript" src="js/jquery.min.js"></script>
	<script type="text/javascript" src="js/daxtra_cvx.js"></script>
	<script type="text/javascript" src="js/bootstrap.min.js"></script>
	<script type="text/javascript" src="js/main.js"></script>
</head>
<body>
	<div class="swap">
		<div class="header">
			<div class="logo">
				<img src="images/logo.png">
			</div>
			<div class="slogan">
				<img src="images/slogan.png">
			</div>
			
		</div>

		<div class="content">
			<div class="panel panel-primary">
				<div class="panel-heading">CV Parsing</div>
				<div class="panel-body">
					<div class="row">
						<div class="col-md-12">
							<div class="panel panel-primary">
								<div class="panel-body">
									<div class="form-group">
										<input type='file' class="form-control-file" id='my_file_upload_id'  />
									</div>
									<div class="form-group">
										<input type='button' class="btn btn-primary" value='CV Parsing' onclick='handle_file_upload_field("my_file_upload_id")'/>
									</div>
								</div>
																
								
							</div>
							
						</div>
						<div class="col-md-12">
							<div class="panel panel-primary">
								<div class="panel-body">
									<ul class="nav nav-tabs" role="tablist">
									    <li class="active"><a href="#persional" data-toggle="tab">Persional</a></li>
									    <li><a href="#additional" data-toggle="tab">Additional</a></li>
									    <li><a href="#education" data-toggle="tab">Education</a></li>
									    <li><a href="#employment-history" data-toggle="tab">Employment History</a></li>
									  
									 </ul>

									  <!-- Tab panes -->
									<div class="tab-content">
										<div id="persional" class="tab-pane fade in active">
											<!-- include/persional.php -->
										</div>

										<div id="additional" class="tab-pane fade">
											<!-- include/additional.php -->
										</div>
										
										<div id="education" class="tab-pane fade">
											<!-- include/education.php -->
										</div>
										
										<div id="employment-history" class="tab-pane fade ">
											<!-- include/employment.php -->
										</div>
										
											
										
									</div>
								</div>
																
								
							</div>
						</div>
						
					</div>
				</div>
			  
			</div>
		</div>
		
	</div>

	

	
</body>
</html>