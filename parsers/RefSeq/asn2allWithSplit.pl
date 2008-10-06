#!/usr/bin/perl -W

use strict;

die "This program take two parameters: the input file (extension .bna.gz),\nand an output directory where generated files are stored"  unless(scalar(@ARGV)==2);

my($MAXREG)=1000;
my($MAXSIZE)=256*1024*1024;
my($BNAGZ);

if(open($BNAGZ,"gunzip -c $ARGV[0] | asn2asn -b t |")) {
	# Getting the preferred file prefix
	my($fileprefix)=substr($ARGV[0],rindex($ARGV[0],'/')+1);
	$fileprefix=substr($fileprefix,0,rindex($fileprefix,'.bna.gz'));
	
	# Uncompressing+ASNfying+splitting
	my($line);
	my($prevline)=undef;
	my($filecounter)=0;
	my($regcounter)=-1;
	my($relregcounter)=-1;
	my($relsizecounter)=0;
	my($isopen)=undef;
	my($justtick)=undef;
	
	my($prolog)='';
	my($epilog)='';
	my($getpost)=undef;
	my($OUTPUT);
	while($line=<$BNAGZ>) {
		# We are in the prolog
		if($regcounter==-1) {
			# Detecting the seq-set ASN.1 field
			if(index($line,'  seq-set')==0) {
				$regcounter++;
				$relregcounter++;
			}
			# Let's store the prefix
			# We NEED it!
			$prolog .= $line;
		} elsif(defined($getpost) || index($line,'  annot')==0) {
			# Let's store the postfix
			# We also NEED it!
			$getpost=1;
			$epilog .= $line;
		} else {
			# A seq or a set. We don't mind
			# which is, because both are records
			if(index($line,'    se')==0) {
				$justtick=1;
				$regcounter++;
				$relregcounter++;
			}
			if(defined($justtick)) {
				# First, file checking
				if((($relregcounter % $MAXREG) eq 1) || ($relsizecounter > $MAXSIZE)) {
					if(defined($prevline)) {
						$prevline =~ s/, *$//;
						chomp($prevline);
						print $OUTPUT $prevline;
						close($OUTPUT);
						#print STDOUT $prevline;

					}
					#if(open($OUTPUT,"| asn2all -o $ARGV[1]/$fileprefix.$filecounter.gbff.xml -v $ARGV[1]/$fileprefix.$filecounter.gpff.xml -a s -f s -b f")) {
					if(open($OUTPUT,'>',"$ARGV[1]/$fileprefix.$filecounter.asn")) {
						$filecounter++;
					} else {
						die "Unable to create asn2all XML generation pipe on file numbered as $filecounter";
					}

					# Now the prolog is the prevline
					$prevline=$prolog;
					$relsizecounter=0;
					$relregcounter=1;
				}
				$justtick=undef;
			}
			
			# Then, line printing
			print $OUTPUT $prevline;
			$relsizecounter += length($prevline);
			#print STDOUT $prevline;
			
			# And current line is the previous one!
			$prevline=$line;
		}
		
	}
	
	# Closing what it is open!!!
	close($BNAGZ);
	
	# Now it is time to postprocess
	if($filecounter>0) {
		print $OUTPUT $prevline;
		#print STDOUT $prevline;
		
		# Do we have an epilog?
		if(length($epilog)>0) {
			print $OUTPUT $epilog;
			#print STDOUT $epilog;
			
			# For the other files (if any)
			$epilog=" } ,\n".$epilog  if($filecounter>1);
		} elsif($filecounter>1) {
			# No epilog for this, but the other files...
			$epilog=" } }\n";
		}
		close($OUTPUT);
		
		# And now, it is time to translate the files to XML!
		# and erasing them...
		$filecounter--;
		foreach my $fcounter (0..$filecounter) {
			my($fasn)="$ARGV[1]/$fileprefix.$fcounter.asn";
			
			# First files do not have ANY epilog!
			if($fcounter<$filecounter) {
				# Let's append epilog...
				if(open($OUTPUT,'>>',$fasn)) {
					print $OUTPUT $epilog;
					close($OUTPUT);
				} else {
					die "Unable to append epilog to $fasn";
				}
			}
			
			system("asn2all -i $fasn -o $ARGV[1]/$fileprefix.$fcounter.gbff.xml -v $ARGV[1]/$fileprefix.$fcounter.gpff.xml -a s -f s -b f");
			unlink($fasn);
		}
	}
} else {
	die "Unable to create decompression + textual ASN.1 pipe";
}