#!/usr/local/bin/perl -w

use strict;

use File::Temp;

# Function prototypes
sub help();
sub splitterXML($$$$\@$$$$);
sub processOutput($$$$$);
sub indexXML($$);

# Global variables/constants

my($xalan)='Xalan';
#my($xalan)='cat';
my($BLOCKSIZE)=1024*1024*20;

my(%CMPTYPE)=(
	'gz'=>'gunzip -c',
	'Z'=>'gunzip -c',
	'bz2'=>'bunzip2 -c'
);

if(scalar(@ARGV)>0) {
	my(@input)=();
	my($output)='-';
	my($begintag);
	my($endtag);
	my($outputtag);
	my($cont)=undef;
	
	my(%xsltparam)=();
	
	my($state)=0;
	my($pstate)=undef;
	my($var);
	my($hasend)=undef;
	my($cmptype)=undef;
	my($xsltsheet)=undef;
	foreach my $argv (@ARGV) {
		if($state==0) {
			if($argv eq '-o') {
				# Output file
				$state=1;
				$pstate=\$output;
			} elsif($argv eq '-p') {
				# XSLT parameter
				$state=2;
			} elsif($argv eq '-xslt') {
				# XSLT sheet
				$state=1;
				$pstate=\$xsltsheet;
			} elsif($argv eq '-bt') {
				# Begin tag in input files
				$state=1;
				$pstate=\$begintag;
			} elsif($argv eq '-et') {
				# End tag in input files
				$state=1;
				$pstate=\$endtag;
			} elsif($argv eq '-ot') {
				# Delimiter tag in output
				$state=1;
				$pstate=\$outputtag;
			} elsif($argv eq '-cmp') {
				# Type of used compression in input
				$state=1;
				$pstate=\$cmptype;
			} elsif($argv eq '-etf') {
				# End tag is a closing entity, rather than a starting one
				$hasend=1;
			} elsif($argv eq '-c') {
				# Concatenate inputs
				$cont=1;
			} elsif($argv eq '-C') {
				# Don't concatenate inputs
				$cont=undef;
			} elsif($argv eq '-h') {
				help();
				exit 0;
			} elsif($argv =~ /^-.+/) {
				help();
				die "ERROR: Unkwown parameter $argv!!!!\n";
			} else {
				push(@input,$argv);
			}
		} elsif($state==1) {
			die "ERROR: parameter not expected $argv"  if($argv =~ /^-.+/);
			$$pstate=$argv;
			$state=0;
		} elsif($state==2) {
			die "ERROR: parameter not expected $argv"  if($argv =~ /^-.+/);
			$var=$argv;
			$state=3;
		} elsif($state==3) {
			$xsltparam{$var}=$argv;
			$state=0;
		} else {
			die "ERROR: unkwnown state $state!!!!\n";
		}
	}
	
	if($state!=0 || (defined($begintag)!=defined($endtag))) {
		die "ERROR: Parameters were not properly specified!!!!\n";
	}
	
	unless(defined($xsltsheet) && defined($outputtag)) {
		die "ERROR: You have not specified XSLT sheet and/or output tag to trap!!!!\n";
	}
	
	if(defined($cmptype) && !exists($CMPTYPE{$cmptype})) {
		die "ERROR: You have specified an unknown compressor ($cmptype)!!!!\n";
	}
	
	if(defined($begintag)) {
		$begintag = "<$begintag";
		$endtag = (defined($hasend)) ? "</$endtag" : "<$endtag";
	}
	
	# We need a tmpfile
	my($tmpfile);
	die "ERROR: unable to create temp file!!!"  unless($tmpfile=File::Temp->new());
	
	# And a Xalan cmdline
	my($xalancmd);
	my($tmpout)=$tmpfile->filename();
	
	$xalancmd="$xalan -o \"$tmpout\"";
	my($xpar,$xval);
	
	while(($xpar,$xval)=each(%xsltparam)) {
		$xalancmd .= " -p \"$xpar\" \"$xval\"";
	}
	
	$xalancmd .= " - $xsltsheet";
	
	# We need at least one input!!!
	if(scalar(@input)==0) {
		$input[0]='-';
	}
	
	# This work will be done splitting and joining
	exit splitterXML($begintag,$endtag,$cont,defined($cmptype)?$CMPTYPE{$cmptype}:undef,@input,$xalancmd,$tmpout,$output,$outputtag);
	
} else {
	help();
	die "$0: incorrect number of parameters...\n";
}
	
sub splitterXML($$$$\@$$$$) {
	my($begintag,$endtag,$cont,$cmpline,$p_input,$xsltline,$tmpout,$output,$outputtag)=@_;

	local(*OUTXML,*XALAN);
	
	if(open(OUTXML,'>'.$output)) {
		# Trying to parse files
		my($header)='';
		my($footer)=undef;
		my($xiter)=0;
		
		my($sentsize)=0;
		my($iter)=0;
		my($maxiter)=scalar(@{$p_input})-1;
		foreach my $fname (@{$p_input}) {
			local(*INFILE);
			
			open(XALAN,'| '.$xsltline) || return 1;
			
			#local(*DEBU);
			#open(DEBU,'>warry.input');
			
			my($fline)=(defined($cmpline))?"$cmpline $fname |":"<$fname";
			if(open(INFILE,$fline)) {
				
				if(defined($begintag)) {
					my($line);
					my($body)=undef;
					
					# Getting/skipping the header and footer
					unless(defined($cont)) {
						$header='';
						$footer=undef;
					}
					
					my($fstate)=(defined($cont) && length($header)>0)?'B':'A';
					while($line=<INFILE>) {
						# Input file header
						# The header (only first iteration)
						my($place);
						my($cachito);
						if(($place=indexXML($line,$begintag))!=-1) {
							if($place>0) {
								$header .= substr($line,0,$place)  if($fstate eq 'A');
								$line = substr($line,$place);
							}
							# We print the header now!!!
							if($fstate eq 'A') {
								print XALAN $header;
								#print DEBU $header;
							}
							$fstate='C';
							print STDERR "Going state $fstate\n";
							last;
						} elsif($fstate eq 'A') {
							$header .= $line;
						}
					}
					
					# Now, the body
					my($baselineE)=undef;
					my($tellE)=undef;
					do {
						# Have I found the foot?
						my($place);
						if(($place=indexXML($line,$endtag))!=-1) {
							print STDERR "Got foot on $fstate\n";
							my($firstfoot)=undef;
							unless(defined($footer)) {
								$footer=substr($line,$place);
								$firstfoot=1;
							}
							$line=substr($line,0,$place);

							if(defined($firstfoot)) {
								my($buffer);
								while($buffer=<INFILE>) {
									$footer .= $buffer;
								}
								print STDERR "Foot is $footer\n";
							}
						}
						my($basestate)=undef;
						if($fstate eq 'D') {
							my($eplace);
							$basestate=$fstate;
							if($place!=-1) {
								$fstate='H';
								print STDERR "Going state $fstate\n";
							} elsif(($eplace=indexXML($line,$begintag))!=-1) {
								unless(defined($footer)) {
									$tellE=tell(INFILE);
									print STDERR "Setting tellE to $tellE\n";
								}
								$baselineE=substr($line,$eplace);
								$line=substr($line,0,$eplace);
								$fstate='E';
								print STDERR "Going state $fstate with baselineE $baselineE\n";
							}
						}
						if($fstate eq 'C' || (defined($basestate) && $basestate eq 'D')) {
							$sentsize+=length($line);
							print XALAN $line;
							#print DEBU $line;
						}
						
						if($fstate eq 'C' && $sentsize>=$BLOCKSIZE) {
							$fstate=($place==-1)?'D':'H';
							print STDERR "Going state $fstate\n";
						}
						
						if(($fstate eq 'H' && !defined($cont)) || ($fstate eq 'E' && defined($footer))) {
							print STDERR "Processing XALAN on state $fstate\n";
							
							print XALAN $footer;
							#print DEBU $footer;
							close(XALAN);
							
							#print DEBU "\n\n--------------NEXT----------------\n\n";
							#print DEBU "\n\n--------------NEXT----------------\n\n";

							$sentsize=0;

							# Processing the output
							processOutput(\*OUTXML,$tmpout,$outputtag,($xiter==0)?1:undef,($iter==$maxiter && $fstate eq 'H')?1:undef);
							$xiter++;
							
							print STDERR "Processed XALAN\n";
							
							$sentsize=0;
							# And coming back!
							if(defined($tellE)) {
								print STDERR "Seeking to $tellE\n";
								# We have to return to the place where we left the work
								if(-p INFILE) {
									# And last! Reopen it!
									close(INFILE);
									open(INFILE,$fline);
									
									while(tell(INFILE)!=$tellE && <INFILE>) {}
								} else {
									seek(INFILE,$tellE,0);
								}
								$tellE=undef;
							}
							if(defined($baselineE)) {
								$line=$baselineE;
								$baselineE=undef;
								$fstate='C';
								$basestate='C';
								print STDERR "Going state $fstate\n";
								open(XALAN,'| '.$xsltline) || return 1;
								print XALAN $header;
								#print DEBU $header;
							}
						}
						unless(defined($basestate) && $basestate eq 'C') {
							$line=<INFILE>;
							die "No!!!!"  unless(defined($line));
						}
					} while($fstate ne 'H');
					
				} else {
					while(<INFILE>) {
						print XALAN;
						#print DEBU;
					}
				}
				close(INFILE);
				
				if(!defined($begintag) || (defined($cont) && $iter==$maxiter)) {
					# Closing the program
					if(defined($begintag)) {
						print XALAN $footer;
						#print DEBU $footer;
					}
					
					close(XALAN);
					$sentsize=0;
					
					# And processing the output
					processOutput(\*OUTXML,$tmpout,$outputtag,($xiter==0)?1:undef,($iter==$maxiter)?1:undef);
					$xiter++;
					
					# And reopening XALAN
					if($iter!=$maxiter) {
						open(XALAN,'| '.$xsltline) || return 1;
						if($cont) {
							print XALAN $header;
							#print DEBU $header;
						}
					}
				}
				$iter++;
			} else {
				die "ERROR: unable to open $fname!!!!\n";
			}
		}
		
		# Last, we should write XML foot
		close(OUTXML);		
	} else {
		die "ERROR: Unable to create $output!!!!\n";
	}
	
	return 0;
}

sub processOutput($$$$$) {
	my($OUTXML,$tmpout,$outputtag,$geth,$getf)=@_;
	
	local(*TMPXML);
	
	system("cp $tmpout caca.".time());
	open(TMPXML,'<'.$tmpout) || return undef;
	my($head)='';
	my($line);
	while($line=<TMPXML>) {
		unless(defined($head)) {
			my($idxplace);
			if(!$getf && ($idxplace=index($line,"</$outputtag>"))!=-1) {
				print $OUTXML substr($line,0,$idxplace);
				last;
				#$line .= "\n"  if(length($line)>0);
			}
			
			print $OUTXML $line;
		} else {
			$head.=$line  if($geth);
			my($idxplace);
			if(($idxplace=indexXML($line,"<$outputtag"))!=-1) {
				print $OUTXML $head  if($geth);
				$head=undef;
			}
		}
	}
	close(TMPXML);
	
	die "FATAL ERROR: Tag $outputtag was never found on XALAN output!!!!\n"  if(defined($head));
	
	return 1;
}


sub help() {
	print STDERR <<EOF;
Usage: $0 {parameters....} {input files}	

	Where {parameters} are:
	-o:	Output file
	-p:	XSLT parameter
	-xslt:	XSLT sheet
	-bt:	Begin tag in input files
	-et:	End tag in input files
	-ot:	Delimiter tag in output
	-cmp:	Type of used compression in input
	-etf:	End tag is a closing entity, rather than a starting one
	-c:	Concatenate inputs
	-C:	Don't concatenate inputs
EOF
}

sub indexXML($$) {
	my $place=index($_[0],$_[1]);
	if($place!=-1) {
		my $cachito=substr($_[0],$place+length($_[1]),1);
		$place=-1  unless($cachito eq ' ' || $cachito eq '>' || $cachito eq "\t" || $cachito eq "\n");
	}
	return $place;
}
